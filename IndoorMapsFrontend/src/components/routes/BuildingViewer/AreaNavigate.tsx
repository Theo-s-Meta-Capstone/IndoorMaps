import { Button, Group, TextInput, rem } from "@mantine/core";
import { AreaToAreaRouteInfo } from "../../../utils/types";
import { IconArrowLeft, IconCurrentLocation, IconLocationShare } from "@tabler/icons-react";

const iconCurrentLocation = <IconCurrentLocation style={{ width: rem(16), height: rem(16) }} />
const iconLocationShare = <IconLocationShare style={{ width: rem(16), height: rem(16) }} />

type Props = {
    areaToAreaRouteInfo: AreaToAreaRouteInfo,
    setIsNavigating: (newVal: boolean) => void,
}

const AreaNavigate = ({ areaToAreaRouteInfo, setIsNavigating }: Props) => {
    return (
        <Group>
            <Button title="back to area search" onClick={() => setIsNavigating(false)}>
                <IconArrowLeft style={{ width: rem(16), height: rem(16) }} />
            </Button>
            <div className="navigationInputs">
                <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={iconCurrentLocation}
                    label="From:"
                    value={areaToAreaRouteInfo.from instanceof Object ? areaToAreaRouteInfo.from.title : "TODO: could be GPS"}
                />
                <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={iconLocationShare}
                    label="To:"
                    value={areaToAreaRouteInfo.to ? areaToAreaRouteInfo.to.title : ""}
                />
            </div>
        </Group>
    )
}

export default AreaNavigate;
