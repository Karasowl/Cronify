import { useState } from "react"
import { Link } from "react-router-dom"


export default function BottomNav() {

  const [pastPosition, setPastPosition] = useState<number>(1)
  const [movement, setMovement] = useState<number>(0)
  const [activeClass, SetActiveClass] = useState<number>(1)
  

   function handleClick(e: React.MouseEvent<HTMLElement>) {
    const target = e.currentTarget as HTMLElement
    
    const newPosition = parseInt(target.getAttribute('custom-position') || '0')
      if (newPosition > pastPosition) {
        setMovement((passMovement:number) => {
          return passMovement + (newPosition - pastPosition)
        })
      } else if (newPosition < pastPosition) {
        setMovement((passMovement:number) => {
          return passMovement - (pastPosition - newPosition)
        })
      }
      SetActiveClass(newPosition)
      setPastPosition(newPosition)
  
  }
    
    return (<div className="bottom-nav">
          <div className="active-button-nav-container">
            <div className="active-button-nav" style={{transform: `translateX(${movement * 100}%)`}}></div>
          </div>
          <div className="bottom-container">
          <Link to='home'  custom-position='1' onClick={handleClick} className="nav-button"><i className={`${activeClass === 1 ? "text-light" : ""} bi bi-house-door button`}></i></Link>
          <Link to='statistics' custom-position='2' onClick={handleClick} className="nav-button"><i className={`${activeClass === 2 ? "text-light" : ""} bi bi-bar-chart button`}></i></Link>
          <Link to='user'  custom-position='3' onClick={handleClick} className="nav-button"><i className={`${activeClass === 3 ? "text-light" : ""} bi bi-person button`}></i></Link>
          <Link to='settings'   custom-position='4' onClick={handleClick} className="nav-button"><i className={`${activeClass === 4 ? "text-light" : ""} bi bi-gear button`}></i></Link>
          </div>
      </div>
    )
  }
  


