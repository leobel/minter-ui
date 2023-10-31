import { ListGroup } from "react-bootstrap";
import { useWizard } from "react-use-wizard";

const SetUp = () => {
    const { goToStep } = useWizard();
    return (
        <div >
            <h3 className="text-center mb-4">Welcome, choose an option below</h3>
            <ListGroup>
                <ListGroup.Item action onClick={() => goToStep(1)}
                    className="d-flex justify-content-between align-items-start"
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">Create Script</div>
                        generate a new policy script
                    </div>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => goToStep(2)}
                    className="d-flex justify-content-between align-items-start"
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">Mint NFT</div>
                        mint tokens
                    </div>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => goToStep(3)}
                    className="d-flex justify-content-between align-items-start"
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">Sign Tx</div>
                        sign a transaction
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </div>
    )
}

export default SetUp;