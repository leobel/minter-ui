import { useWizard } from "react-use-wizard";

const CreateScript = () => {
    const { nextStep } = useWizard();
    return (
        <>
            <p>Create Script</p>
        </>
    );
};

export default CreateScript;