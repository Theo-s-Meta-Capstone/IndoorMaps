import { TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import { useDebounce } from "../../utils/hooks";
import { graphql, useFragment } from "react-relay";
import { GuideImageFragment$key } from "./__generated__/GuideImageFragment.graphql";
import { FloorSidebarFloorMutation$variables } from "./__generated__/FloorSidebarFloorMutation.graphql";
import { FloorSidebarBodyFragment$data } from "./__generated__/FloorSidebarBodyFragment.graphql";
import { removeAllLayersFromLayerGroup } from "../../utils/utils";

const GuideImageFragment = graphql`
  fragment GuideImageFragment on Floor
  {
    id
    databaseId
    guideImage
    guideImageShape
    guideImageRotation
  }
`;

type Props = {
    map: L.Map;
    setFormError: (error: string) => void;
    currentFloorData: GuideImageFragment$key;
    modifyFloor: (variables: FloorSidebarFloorMutation$variables) => Promise<void>;
    imageOverlayMapLayer: L.GeoJSON;
    startPos: FloorSidebarBodyFragment$data["startPos"]
}

const GuideImage = ({ startPos, imageOverlayMapLayer, modifyFloor, currentFloorData, map, setFormError }: Props) => {
    const floorData = useFragment(GuideImageFragment, currentFloorData);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState<number>(floorData.guideImageRotation ?? 0);
    const debouncedRotation = useDebounce(rotation, rotation, 100)
    const hasAlreadyAddedImage = useRef<boolean>(false);
    const [guideImageUrl, setGuideImageUrl] = useState<string>(floorData.guideImage ?? "");
    const imageOverlayRef = useRef<L.ImageOverlay>();

    const startingLatLngBounds = L.latLngBounds([startPos.lat, startPos.lon], [startPos.lat + .0005, startPos.lon + .0005]);

    const clearGuideLayer = () => {
        removeAllLayersFromLayerGroup(imageOverlayMapLayer, map)
        hasAlreadyAddedImage.current = false;
    }

    const addEditableImageToFloor = () => {
        if (hasAlreadyAddedImage.current) return;

        let guideBoundingRect: L.Rectangle;
        if (floorData.guideImageShape) {
            const coords = (JSON.parse(floorData.guideImageShape) as GeoJSON.Feature<GeoJSON.Polygon>);
            const tempShape = L.geoJSON().addData(coords).getLayers()[0] as L.Polygon;
            guideBoundingRect = L.rectangle(tempShape.getBounds()).addTo(imageOverlayMapLayer); // the Leaflet constructor always creates a non-rotated rectangle
            guideBoundingRect.setLatLngs(tempShape.getLatLngs())
            guideBoundingRect.pm.setInitAngle(rotation);
        } else {
            guideBoundingRect = L.rectangle(startingLatLngBounds).addTo(imageOverlayMapLayer);
        }
        imageOverlayMapLayer.addTo(map)

        const imageOverlay = L.imageOverlay("", guideBoundingRect.getBounds(), {
            opacity: 0.7,
            interactive: true,
            snapIgnore: true,
        }).addTo(imageOverlayMapLayer);
        imageOverlay.pm.setOptions({
            allowEditing: false,
            allowRemoval: false,
            allowRotation: false,
            draggable: false,
        })
        imageOverlayRef.current = imageOverlay;

        // giving the rect a fill color so that it accepts pointer events
        guideBoundingRect.setStyle({ fillColor: "white", fillOpacity: 0, fillRule: "evenodd" })
        guideBoundingRect.pm.disableRotate()
        guideBoundingRect.pm.setOptions({
            allowEditing: true,
            allowRemoval: false,
            allowRotation: true,
            draggable: true,
        })

        guideBoundingRect.on("pm:rotate", (e) => {
            setRotation(e.angle)
        })

        guideBoundingRect.on("pm:edit", (e: L.LeafletEvent) => {
            imageOverlay.setBounds(guideBoundingRect.getBounds())
            modifyFloor({
                data: {
                    id: floorData.databaseId,
                    newGuideImageShape: {
                        shape: JSON.stringify(guideBoundingRect.toGeoJSON()),
                    }
                }
            })
        })

        hasAlreadyAddedImage.current = true;
    }

    const drawImage = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement, rotation: number) => {
        const rotationRadians = rotation * Math.PI / 180;
        const scaleFacotorH = Math.abs(canvas.width * Math.sin(rotationRadians)) + Math.abs(canvas.height * Math.cos(rotationRadians))
        const scaleFacotorW = Math.abs(canvas.width * Math.cos(rotationRadians)) + Math.abs(canvas.height * Math.sin(rotationRadians))
        canvas.height = scaleFacotorH
        canvas.width = scaleFacotorW
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotationRadians);
        ctx.drawImage(image, -image.width * 0.5, -image.height * 0.5);
        ctx.restore();
    }
    const getRotatedImage = (url: string) => {
        if (!canvas.current) return;
        const ctx = canvas.current.getContext("2d")
        if (!ctx) return;
        const img = new Image();
        img.src = url;
        img.crossOrigin = "anonymous";
        img.addEventListener("load", () => {
            if (!canvas.current || !ctx) return
            canvas.current.height = img.height;
            canvas.current.width = img.width;
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
            drawImage(canvas.current, ctx, img, debouncedRotation)
            canvas.current.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                imageOverlayRef.current?.setUrl(url)
            }, 'image/png');
        });
        img.addEventListener("error", () => {
            setFormError("failed to load guide image");
            clearGuideLayer();
        })
    }

    useEffect(() => {
        if (guideImageUrl === "" || !canvas.current) return;
        getRotatedImage(guideImageUrl)
        modifyFloor({
            data: {
                id: floorData.databaseId,
                guideImageRotation: debouncedRotation,
            }
        })
    }, [debouncedRotation])

    useEffect(() => {
        if (guideImageUrl === "" || !canvas.current) return;
        getRotatedImage(guideImageUrl)
        if (guideImageUrl === floorData.guideImage) return;
        modifyFloor({
            data: {
                id: floorData.databaseId,
                guideImage: guideImageUrl,
            }
        })
    }, [guideImageUrl])

    useEffect(() => {
        hasAlreadyAddedImage.current = false
        clearGuideLayer();
        setGuideImageUrl(floorData.guideImage ?? "");
        if (guideImageUrl === "" || !canvas.current) return;
        addEditableImageToFloor();
    }, [floorData.databaseId])

    return (
        <>
            <canvas style={{ display: "none" }} ref={canvas} id="tutorial" width="600" height="600"></canvas>
            <i>Guide Image is currently experimental</i>
            <TextInput label="Guide Image Url" placeholder="Enter Guide Image Url" value={guideImageUrl} onChange={(e) => setGuideImageUrl(e.target.value)} />
            <p>Consider using <a href="https://imgbb.com/">https://imgbb.com/</a> to upload your image, then copy the embed url<br /> *Generally will not work with images not intended to be embedded due to cors</p>
        </>
    )
}

export default GuideImage;
