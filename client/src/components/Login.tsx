import { Button, Image, Form } from "react-bootstrap";

const Login = () => {
  return (
    <div id="login">
        <div className="img-container container w-75 d-flex justify-content-center align-items-center flex-column ">
          <Image
            className="img-fluid img-logo"
            src="../../public/cronify.svg"
            fluid
          />
          <p>CRONI.FY</p>
        </div>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Check me out" />
          </Form.Group>
          <Button
            onClick={(event) => {
              event.preventDefault();
            }}
            variant="primary"
            type="submit"
          >
            Submit
          </Button>
        </Form>
      </div>
  );
};

{
  /* <Button onClick={()=>{
    context.isLoggedState = true
    setLogued(true)
}}>Login</Button> */
}
export default Login;
