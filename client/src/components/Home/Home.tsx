import BodyCard from "../Cards/BodyCard"
import {useEffect, useState, useContext } from 'react'
import fetchCards from "../../helpers/fetch"
import { urls } from "../../helpers/enums"
import ErrorContext from "../../context/error-context/Error-context"
import * as Types from  './../../types'

export default function Home() {
  const [cards, setCards] = useState<Types.ICard[]>([])
  const errorState = useContext(ErrorContext)

useEffect(() => {
    const fetching = async () => {
      try {
        const response = await fetchCards<Types.ICard[] | string>({url:urls.getCards})
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
      {cards.length > 0 && cards.map((card) => {
      const {_id, title} = card
      return (
      <div key={_id} className="body-card">
      <BodyCard key={_id} title={title}/>
      </div>
      )
      })}
    </div>
  );
}
