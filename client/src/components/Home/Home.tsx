import BodyCard from "../Cards/BodyCard"
import {useEffect, useState, useContext } from 'react'
import fetchCards from "../../helpers/fetch"
import { urls } from "../../helpers/enums"
import ErrorContext from "../../context/error-context/Error-context"
import * as Types from  './../../types'
import { Button } from "react-bootstrap"

export default function Home() {
  const [cards, setCards] = useState<Types.ICard[]>([])
  const errorState = useContext(ErrorContext)

useEffect(() => {
    const fetching = async () => {
      try {
        const response = await fetchCards<Types.ICard[] | string>({url:urls.getCards, options:{
          method: 'GET',
          headers: {
            "content-Type": "application/json",
            auth:localStorage.token
          }
        }})
        if(typeof response === 'string'){
            errorState.addError(response)
        } else {
          console.log(response)
          setCards(response)
        }
      } catch (err) {

          console.log(err)

        
      }
    }
    fetching()
  },[])


  return (
    <div id="home" className=''>
      <div id="cards">
     <div id="cards-opt">
        <div id="cards-total">
        <p>Cards</p>
        <span>{cards.length}</span>
        </div>
        <Button><i className="bi bi-plus"></i></Button>
     </div>
     <div id="cards-grid">
      {cards.length > 0 && cards.map((card) => {
      const {_id, title} = card
      return (
      <div key={_id} className="body-card">
      <BodyCard key={_id} title={title}/>
      </div>
      )
      })}
     </div>
      </div>
    </div>
  );
}
