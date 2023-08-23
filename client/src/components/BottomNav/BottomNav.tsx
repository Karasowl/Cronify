import { useState, useRef, useEffect} from "react"


export default function BottomNav() {
  const [buttonElements, setButtonElements] = useState<HTMLButtonElement[]>([]);

  useEffect(() => {
    const buttons = Array.from(rootDiv.current?.querySelectorAll('button') || []);
    setButtonElements(buttons);
  }, []);
  

  const backDiv = useRef<HTMLDivElement>(null)
  const rootDiv = useRef<HTMLDivElement>(null)

  const [pastPosition, setPastPosition] = useState<number>(1);
  const [pastMovement, setPastMovement] = useState<number>(0);



  function handleClick(e:MouseEventHandler<HTMLButtonElement>) {
    const {target} = e

    buttonElements.forEach((element: HTMLButtonElement) => {
      const icon = element.querySelector('i');
      if (element === target) {
        icon?.classList.add('text-light');
      } else {
        icon?.classList.remove('text-light');
      }
    });


    const newPosition = parseInt(target.getAttribute('custom-position'))
    if (backDiv.current){
      console.log(backDiv.current.style.transform)
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
    console.log(target.getAttribute('custom-position'))
    console.log(pastMovement)

  }
  

  return (
    <div ref={rootDiv} className="bottom-nav">
        <div className="active-button-nav-container">
          <div ref={backDiv} className="active-button-nav"></div>
        </div>
        <div className="bottom-container">
        <button custom-position='1' onClick={handleClick}><i className="text-light bi bi-house-door"></i></button>
        <button custom-position='2' onClick={handleClick}><i className="bi bi-bar-chart"></i></button>
        <button custom-position='3' onClick={handleClick}><i className="bi bi-person"></i></button>
        <button custom-position='4' onClick={handleClick}><i className="bi bi-gear"></i></button>
        </div>
    </div>
  )
}
