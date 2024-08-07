import { Group, HoverCard, Text } from "@mantine/core"
import { graphql, useFragment } from "react-relay";
import { FloorListItemFragment$key } from "./__generated__/FloorListItemFragment.graphql";

const FloorListFragment = graphql`
  fragment FloorListItemFragment on Floor
  {
    databaseId
    id
    title
    description
    shape
  }
`;

type Props = {
  floorFromParent: FloorListItemFragment$key;
  currentFloor: number | null;
  setCurrentFloor: (floor: number) => void;
}

const FloorListItem = ({ floorFromParent, currentFloor, setCurrentFloor }: Props) => {
  const floorData = useFragment(FloorListFragment, floorFromParent);
  const noShapeAlertText = `Floor ${floorData.title} does not have a shape yet, create one with the polygon tool`;
  return (
    <Group onClick={() => setCurrentFloor(floorData.databaseId)} className={"FloorListItem " + (currentFloor === floorData.databaseId ? "Selected" : "")}>
      <div>{floorData.title}</div>
      <div className="FloorListItemDescription">{floorData.description}</div>
      {floorData.shape ? null :
        <HoverCard width={200} position="bottom" withArrow shadow="md">
          <HoverCard.Target>
            <button style={{border: "none"}} aria-label={noShapeAlertText} className='NoAreaInformer'>!</button>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text>{noShapeAlertText}</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      }

    </Group>
  )
}

export default FloorListItem;
