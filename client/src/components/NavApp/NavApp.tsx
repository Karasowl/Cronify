// import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
// import Form from 'react-bootstrap/Form';
// import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
// import Offcanvas from 'react-bootstrap/Offcanvas';
import { useLocation } from 'react-router-dom';

type TNavBarPage = {
    title: string,
    containerClassName: string,
    toggleClassName: string
}

type TNavBarPages = {
  [key:string] : TNavBarPage
}

function OffcanvasExample() {

  const location = useLocation()

  const titlesPage:TNavBarPages = {
    login: {
      title: 'LOGIN',
      containerClassName: 'd-flex justify-content-center align-items-center',
      toggleClassName: 'd-none',
  },
    else: {
      title: 'CRONI.FY',
      containerClassName: '',
      toggleClassName: ''
  }
  }
  
  const currentNavBar = ():TNavBarPage => {
    
    const currentPath = location.pathname.replace("/","")
    if(currentPath === "login") return titlesPage.login
    return titlesPage.else
  
  }
    const expand = ""
  return (
    <>
        <Navbar data-bs-theme='dark' key={expand} expand={expand} className="bg-primary mb-3">
          <Container fluid className={currentNavBar().containerClassName}>
            <Navbar.Brand href="#">{currentNavBar().title}</Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} className={currentNavBar().toggleClassName}/>
          </Container>
        </Navbar>
    </>
  );
  {/* <Navbar.Offcanvas
    id={`offcanvasNavbar-expand-${expand}`}
    aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
    placement="end"
  >
    <Offcanvas.Header closeButton>
      <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
        Offcanvas
      </Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
      <Nav className="justify-content-end flex-grow-1 pe-3">
        <Nav.Link href="#action1">About</Nav.Link>
        <Nav.Link href="#action2">Link</Nav.Link>
        <NavDropdown
          title="Dropdown"
          id={`offcanvasNavbarDropdown-expand-${expand}`}
        >
          <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
          <NavDropdown.Item href="#action4">
            Another action
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="#action5">
            Something else here
          </NavDropdown.Item>
        </NavDropdown>
      </Nav>
      <Form className="d-flex">
        <Form.Control
          type="search"
          placeholder="Search"
          className="me-2"
          aria-label="Search"
        />
        <Button variant="outline-light opacity-50">Search</Button>
      </Form>
    </Offcanvas.Body>
  </Navbar.Offcanvas> */}
}

export default OffcanvasExample;