import { Group } from "@mantine/core";
import { graphql, useFragment } from "react-relay";
import { BuildingItemFragment$key } from "./__generated__/BuildingItemFragment.graphql";

const BuildingFragment = graphql`
  fragment BuildingItemFragment on Building {
    id
    title
    description
  }
`;

type BuildingItemProps = {
    building: BuildingItemFragment$key;
}

function BuildingItem({ building }: BuildingItemProps) {
    const data = useFragment(
        BuildingFragment,
        building,
    );
    return (
        <Group key={data.id}>
            <h2>{data.title}</h2>
            <p>{data.description}</p>
        </Group>
    )
}

export default BuildingItem;
