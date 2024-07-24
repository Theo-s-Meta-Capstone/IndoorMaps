import { Button, Modal, TextInput, Group, Loader } from "@mantine/core";
import { hasLength, isNotEmpty, useForm } from "@mantine/form";
import { Suspense, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import FormErrorNotification from "./FormErrorNotification";
import AutoCompleteResults from "./AutoCompleteResults";
import { AutoCompleteResultsFragment$key } from "./__generated__/AutoCompleteResultsFragment.graphql";
import { EditBuildingModalGetDataFragment$key } from "./__generated__/EditBuildingModalGetDataFragment.graphql";
import { EditBuildingModalMutation } from "./__generated__/EditBuildingModalMutation.graphql";
import { useChooseAutocompleteResult } from "../../utils/hooks";

const EditBuildingGetDataFragment = graphql`
  fragment EditBuildingModalGetDataFragment on Building
  {
    id
    databaseId
    title
    startPos {
      lat
      lon
    }
    address
  }
`;

type Props = {
    isOpen: boolean,
    closeModal: () => void,
    getGeocoder: AutoCompleteResultsFragment$key,
    buildingFromParent: EditBuildingModalGetDataFragment$key
}

const EditBuildingModal = ({ isOpen, closeModal, getGeocoder, buildingFromParent }: Props) => {
    const buildingData = useFragment(EditBuildingGetDataFragment, buildingFromParent);
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm({
        mode: 'controlled',
        initialValues: { buildingName: buildingData.title, address: buildingData.address, startingPosition: buildingData.startPos.lat + ", " + buildingData.startPos.lon },
        validate: {
            buildingName: hasLength({ min: 4 }, 'Building name must be at least 4 characters long'),
            address: isNotEmpty('Please enter an address'),
            startingPosition: isNotEmpty('Please enter a starting position'),
        },
    });
    const handleChooseAutocompleteResult = useChooseAutocompleteResult(
        (newStartingPositionValue: string) => form.setFieldValue('address', newStartingPositionValue),
        (newAddressValue: string) => form.setFieldValue('startingPosition', newAddressValue),
        (errorMessage: string) => setFormError(errorMessage),
    )

    const [commit, isInFlight] = useMutation<EditBuildingModalMutation>(graphql`
        mutation EditBuildingModalMutation($input: BuildingUpdateInput!) {
            updateBuilding(data: $input) {
                id
                databaseId
                ...BuildingEditorBodyFragment
                ...EditBuildingModalGetDataFragment
            }
        }
    `);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            commit({
                variables: {
                    input: {
                        buildingDatabseId: buildingData.databaseId,
                        title: values.buildingName,
                        address: values.address,
                        startLat: parseFloat(values.startingPosition.split(', ')[0]),
                        startLon: parseFloat(values.startingPosition.split(', ')[1]),
                    },
                },
                onCompleted() {
                    closeModal();
                },
                onError(error) {
                    setFormError(error.message);
                }
            });
        } catch (error) {
            const errorMessage = (error as Error).message;
            setFormError(errorMessage);
        }
    };

    return (
        <Modal
            opened={isOpen}
            onClose={() => closeModal()}
            title={`Edit ${buildingData.title} details`}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <form method="dialog" onSubmit={form.onSubmit(handleSubmit)}>
                <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
                <TextInput {...form.getInputProps('buildingName')} autoComplete="on" label="Building Name (Changing the name will break all links to the building)" placeholder="West Seattle Grocery Central" />
                <TextInput {...form.getInputProps('address')} autoComplete="address" label="Address" placeholder="123 California Way" />
                <Suspense fallback={<Loader color="blue" />}>
                    <AutoCompleteResults chooseAutocompleteResult={handleChooseAutocompleteResult} searchString={form.values.address} getGeocoder={getGeocoder} />
                </Suspense>
                <TextInput {...form.getInputProps('startingPosition')} label="Starting Position Lat, Long" placeholder="47.57975292676628, -122.38632782878642" />
                <Group>
                    <Button type="submit" disabled={isInFlight}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default EditBuildingModal;
