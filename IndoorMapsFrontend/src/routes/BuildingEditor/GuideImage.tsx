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
    const rotationRef = useRef<number>(0);
    const [guideImageUrl, setGuideImageUrl] = useState<string>(floorData.guideImage ?? "");
    const imageOverlayRef = useRef<L.ImageOverlay>();

    useEffect(() => {
        rotationRef.current = debouncedRotation;
    }, [debouncedRotation])

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
            guideBoundingRect = L.rectangle(L.geoJSON(coords).getBounds()).addTo(imageOverlayMapLayer); // the Leaflet constructor always creates a non-rotated rectangle
        } else {
            guideBoundingRect = L.rectangle(startingLatLngBounds).addTo(imageOverlayMapLayer);
        }

        const imageOverlay = L.imageOverlay(guideImageUrl, guideBoundingRect.getBounds(), {
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

        guideBoundingRect.setStyle({ fillColor: "white", fillOpacity: .0, fillRule: "evenodd" })
        guideBoundingRect.pm.disableRotate()
        guideBoundingRect.pm.setOptions({
            allowEditing: true,
            allowRemoval: false,
            allowRotation: false,
            draggable: true,
        })

        const guideRotationHandle = L.rectangle(guideBoundingRect.getBounds(), { className: "rotationControler" }).addTo(imageOverlayMapLayer); // the Leaflet constructor always creates a non-rotated rectangle
        guideRotationHandle.pm.setOptions({
            allowEditing: false,
            allowRemoval: false,
            allowRotation: true,
            draggable: false,
        })
        guideRotationHandle.on("pm:rotate", (e) => {
            setRotation(e.angle)
        })
        guideRotationHandle.setStyle({ fill: false, stroke: false })

        guideBoundingRect.on("pm:edit", (e: L.LeafletEvent) => {
            modifyFloor({
                data: {
                    id: floorData.databaseId,
                    newGuideImageShape: {
                        shape: JSON.stringify(e.layer.toGeoJSON()),
                    }
                }
            })
            imageOverlay.setBounds(guideBoundingRect.getBounds())
            guideRotationHandle.setBounds(guideBoundingRect.getBounds())
            guideRotationHandle.pm.setInitAngle(0)
            guideRotationHandle.pm.rotateLayerToAngle(rotationRef.current)
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
        addEditableImageToFloor();
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
            <p>Consider using <a href="https://imgbb.com/">https://imgbb.com/</a> to upload your image, then copy the embed url</p>
        </>
    )
}

export default GuideImage;
