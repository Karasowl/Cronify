import BodyCard from "../Cards/BodyCard"
import {useEffect, useState, useContext } from 'react'
import fetchCards from "../../helpers/fetch"
import { urls } from "../../helpers/enums"
import ErrorContext from "../../context/error-context/Error-context"
import * as Types from  './../../types'
import { Button } from "react-bootstrap"

export default function Home() {

  const [cardsUpdated, setCardsUpdated] = useState<number>(0)
  const [cards, setCards] = useState<Types.ICard[]>([])
  const errorState = useContext(ErrorContext)

useEffect(() => {
    const fetching = async () => {
      try {
        const response = await fetchCards<Types.ICard[] | string>({url:urls.getCards, options:{
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            auth:localStorage.token || sessionStorage.token
          }
        }})
        if(typeof response === 'string'){
            errorState.addError(response)
        } else {
          console.log(response)
          response.reverse()
          setCards(response)
        }
      } catch (err) {

          console.log(err)

        
      }
    }
    localStorage.token || sessionStorage.token ? fetching() : null
  },[cardsUpdated])

  return (
    <div id="home" className=''>
      <div id="cards">
     <div id="cards-opt">
        <div id="cards-total">
        <p>Cards</p>
        <span>{cards.length}</span>
        </div>
        <Button
        onClick={async (e) => {
          e.preventDefault()
            const card = {
              "title": "Lisi te Amo",
              "user": "64e926a281f55b8c60b0a011",
              "cardType": {
                  "type":"STOP",
                  "totalTime": 3000,
                  "stops": [],
                  "days": [{
                      "Ischeck": false,
                      "date": "2023-08-25T22:05:49.147Z"
                  }]
              },
              "starTime":"",
              "goals": [{
                "id":"1",
                "active":true,
                "achieved": false,
                "startDate": "2023-08-25T22:05:49.147Z",
                "totalTime": 334566
            }],
              "appTime": ""
          }

          await fetchCards({url:urls.createCard, options:{
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(card)

          }})
          setCardsUpdated(prev=> prev + 1)
        }}
        ><i className="bi bi-plus"></i></Button>
     </div>
     <div id="cards-grid">
      {cards.length > 0 && cards.map((card) => {
          const BodyCardProps: Types.IPropsHome = {
            card: card as Types.ICard,
            updateCards: setCardsUpdated
          };
      return (
      
      <div key={card._id} className="body-card">
<BodyCard key={card._id} {...BodyCardProps} />

      </div>
      )
      })}
     </div>
      </div>
    </div>
  );
}
