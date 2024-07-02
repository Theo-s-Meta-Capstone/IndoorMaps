import { graphql, useFragment } from "react-relay";
import { EditorSidebarBodyFragment$key } from "./__generated__/EditorSidebarBodyFragment.graphql";

const EditorSidebarFragment = graphql`
  fragment EditorSidebarBodyFragment on Building
  {
    id
    databaseId
    title
    startPos {
      lat
      lon
    }
    address
    floors {
      id
      title
      address
    }
  }
`;

interface Props {
    buildingFromParent: EditorSidebarBodyFragment$key;
}

const EditorSidebar = ({buildingFromParent}:Props) => {
    const buildingData = useFragment(EditorSidebarFragment, buildingFromParent);

    return (
        <div>
            <h1>Editor Sidebar</h1>
            <div>{JSON.stringify(buildingData)}</div>
        </div>
    )
}

export default EditorSidebar;
