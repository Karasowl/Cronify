import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"


export default function BottomNav() {
  const [buttonElements, setButtonElements] = useState<Element[]>([])
  const location = useLocation()
  const [inLoginPage, setInLoginPage] = useState<boolean>(false)

  useEffect(() => {
    const buttons = Array.from(rootDiv.current?.querySelectorAll('.nav-button') || [])
    setButtonElements(buttons)
  }, [])

  
  

  const backDiv = useRef<HTMLDivElement>(null)
  const rootDiv = useRef<HTMLDivElement>(null)

  const [pastPosition, setPastPosition] = useState<number>(1)
  const [pastMovement, setPastMovement] = useState<number>(0)
  
  
  useEffect(() => {
    buttonElements.forEach((element: Element) => {
      const icon = element.querySelector('i');
      if (element.getAttribute('custom-position') === String(pastPosition)) {
        icon?.classList.add('text-light');
      } else {
        icon?.classList.remove('text-light');
      }
    });
  }, [buttonElements, pastPosition]);

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    const target = e.currentTarget as HTMLElement
    
    const newPosition = parseInt(target.getAttribute('custom-position') || '0')
    if (backDiv.current){
      if (newPosition > pastPosition) {
        const movement = ((newPosition - pastPosition) * 100) + pastMovement
        backDiv.current.style.transform = `translateX(${movement}%)`
        setPastMovement(movement)
      } else if (newPosition < pastPosition) {
        const movement =  pastMovement - ((pastPosition - newPosition) * 100)
          backDiv.current.style.transform = `translateX(${movement}%)`
          setPastMovement(movement)
      }

    }
    
    setPastPosition(newPosition)

  }
  

  return (
    inLoginPage? null : (<div ref={rootDiv} className="bottom-nav">
        <div className="active-button-nav-container">
          <div ref={backDiv} className="active-button-nav"></div>
        </div>
        <div className="bottom-container">
        <Link to='home'  custom-position='1' onClick={handleClick} className="nav-button"><i className="text-light bi bi-house-door button"></i></Link>
        <Link to='statistics' custom-position='2' onClick={handleClick} className="nav-button"><i className="bi bi-bar-chart button"></i></Link>
        <Link to='user'  custom-position='3' onClick={handleClick} className="nav-button"><i className="bi bi-person button"></i></Link>
        <Link to='settings'   custom-position='4' onClick={handleClick} className="nav-button"><i className="bi bi-gear button"></i></Link>
        </div>
    </div>)
  )
}
