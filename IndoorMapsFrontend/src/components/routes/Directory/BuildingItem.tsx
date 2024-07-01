import { Group } from "@mantine/core";
import { graphql, useFragment } from "react-relay";
import { BuildingItemFragment$key } from "./__generated__/BuildingItemFragment.graphql";
import { Link } from "react-router-dom";

const BuildingFragment = graphql`
  fragment BuildingItemFragment on Building {
    id
    title
    description
    databaseId
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
        <Link to={`/building/${data.databaseId}/viewer`}>
            <Group key={data.id} >
                <h2>{data.title}</h2>
                <p>{data.description}</p>
            </Group>
        </Link>
    )
}

export default BuildingItem;
