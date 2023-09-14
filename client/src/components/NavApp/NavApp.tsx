import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useLocation } from 'react-router-dom';
import {routes} from '../../helpers/enums';
import * as Types from "./../../types"
import UserContext from '../../context/user-context';
import { useContext } from 'react';

function OffcanvasExample() {
  const location = useLocation()
  const userState = useContext(UserContext)

  const titlesPage: Types.INavBarPages = {
    login: {
      title: 'LOGIN',
      containerClassName: 'd-flex mx-3',
      toggleClassName: 'd-none',
      buttonClassName: 'd-none'
    },
    else: {
      title: 'CRONI.FY',
      containerClassName: 'mx-3',
      toggleClassName: '',
      buttonClassName: 'opacity-25'
    }
  }
  //cambiar elementos del Navbar según la url
  const currentNavBar = (): Types.INavBarPage => {
    const currentPath = location.pathname
    if (currentPath === routes.login || currentPath === routes.register) return titlesPage.login
    return titlesPage.else
  }
  ///

  //desloguearse 
  const logout = () => {
    console.log(`logout activado`)
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    userState.loginState.setLoginState(false)
  }
  ///
  
  const expand = ""
  return (
    <>
      <Navbar data-bs-theme='dark' key={expand} expand={expand} className="bg-primary mb-3">
        <Container fluid className={currentNavBar().containerClassName}>
          <Navbar.Brand href="#">{currentNavBar().title}</Navbar.Brand>
          <Button onClick={()=>{
            
            console.log(`Onclick del Nav activado`)
            logout()
          }} className={currentNavBar().buttonClassName}><i className='bi bi-box-arrow-right'></i></Button>
          {/* <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} className={currentNavBar().toggleClassName}/> */}
        </Container>
      </Navbar>
    </>
  )}

export default OffcanvasExample;