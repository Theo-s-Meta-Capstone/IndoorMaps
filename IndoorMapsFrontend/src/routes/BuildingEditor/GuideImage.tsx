import { TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import { useDebounce } from "../../utils/hooks";
import { removeAllLayersFromLayerGroup } from "../../utils/utils";

type Props = {
    map: L.Map;
    floorMapLayer: L.GeoJSON;
    setFormError: (error: string) => void;
}

const imageGuideOverlay = L.geoJSON();

const GuideImage = ({ map, floorMapLayer, setFormError }: Props) => {
    const canvas = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState<number>(0);
    const debouncedRotation = useDebounce(rotation, rotation, 100)
    const hasAlreadyAddedImageRef = useRef<boolean>(false);
    const rotationRef = useRef<number>(0);
    const [guideImageUrl, setGuideImageUrl] = useState<string>("");

    useEffect(() => {
        rotationRef.current = debouncedRotation;
    }, [debouncedRotation])


    var latLngBounds = L.latLngBounds([37.48476370807255, -122.14827817912189], [37.485283029418994, -122.14775246616237]);

    const addEditableImageToFloor = () => {
        if (hasAlreadyAddedImageRef.current) return;
        hasAlreadyAddedImageRef.current = true;
        const coords = latLngBounds;
        imageGuideOverlay.addTo(floorMapLayer)
        const guideBoundingRect = L.rectangle(coords).addTo(imageGuideOverlay); // the Leaflet constructor always creates a non-rotated rectangle
        guideBoundingRect.setStyle({ fillColor: 'url(#guideBackgroundImage)', fillOpacity: .5, fillRule: "evenodd" })
        guideBoundingRect.pm.disableRotate()
        guideBoundingRect.pm.setOptions({
            allowEditing: true,
            allowRemoval: false,
            allowRotation: false,
            draggable: true,
        })

        const guideBoundingRectElement = guideBoundingRect.getElement()

        if (guideBoundingRectElement) {
            guideBoundingRectElement.insertAdjacentHTML('beforebegin', `
                <defs>
                    <pattern height="100%" width="100%"
                    patternContentUnits="objectBoundingBox"
                    preserveAspectRatio="xMidYMid slice"
                    id="guideBackgroundImage">
                    </pattern>
                </defs>
                `);
        }

        const guideRotationHandle = L.rectangle(coords).addTo(imageGuideOverlay); // the Leaflet constructor always creates a non-rotated rectangle
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
        const guideRotationHandleElement = guideRotationHandle.getElement()

        if (guideRotationHandleElement) {
            guideRotationHandleElement.classList.add("rotationControler")
        }

        guideBoundingRect.on("pm:edit", () => {
            guideRotationHandle.setBounds(guideBoundingRect.getBounds())
            guideRotationHandle.pm.setInitAngle(0)
            guideRotationHandle.pm.rotateLayerToAngle(rotationRef.current)
        })
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
                const patternImage = document.getElementById("guideBackgroundImage");
                if (!patternImage) {
                    setFormError("fail to load guide image from canvas")
                    return;
                };
                patternImage.innerHTML = `<image id="patternImage"
                href="${url}" height="1" width="1" preserveAspectRatio="none"/>`
            }, 'image/png');
        });
        img.addEventListener("error", () => {
            setFormError("failed to load guide image");
            hasAlreadyAddedImageRef.current = false;
            removeAllLayersFromLayerGroup(imageGuideOverlay, map);
        })
    }

    useEffect(() => {
        if (guideImageUrl === "") return;
        addEditableImageToFloor();
        getRotatedImage(guideImageUrl)
    }, [guideImageUrl, canvas.current, debouncedRotation])

    return (
        <>
            <canvas style={{ display: "none" }} ref={canvas} id="tutorial" width="600" height="600"></canvas>
            <TextInput label="Guide Image Url" placeholder="Enter Guide Image Url" onChange={(e) => setGuideImageUrl(e.target.value)} />
        </>
    )
}

export default GuideImage;
