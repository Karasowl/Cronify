import type * as Types from './../../types'
import { ECardsType, urls } from '../../helpers/enums'
import {format, parseISO, intervalToDuration, differenceInMinutes, subMinutes, formatDuration, milliseconds, formatISO, set} from 'date-fns'
import {useContext, useEffect, useState } from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'
import { es } from 'date-fns/locale'
import { ProgressBar } from 'react-bootstrap'
import fetcher from '../../helpers/fetch'
import ErrorContext from '../../context/error-context/Error-context'

export default function BodyCard({...props}: Types.IPropsHome) {
  
  const [startTime, setStartTime] = useState('')
  const [years, setYears] = useState(0)
const [months, setMonths] = useState(0)
const [days, setDays] = useState(0)
const [circularBar, setCircularBar] = useState(0)
const [hours, setHours] = useState(0)
const [minutes, setMinutes] = useState(0)
const [seconds, setSeconds] = useState(0)
const goalReceived = {days:1}
const [goal, setGoal] = useState(goalReceived)
const [percentBar, setPercentBar] = useState(0)
const [maxReached, setmaxReached] = useState<Duration | null>(props.card.maxReached)
const errorState = useContext(ErrorContext)

const maxReachedFromated = () => {
  let formated:string
if(maxReached){
  if(milliseconds(maxReached) < 1000 * 60 *60){
    formated = formatDuration(maxReached, {locale:es, format: ['minutes', 'seconds']})
  }else if(milliseconds(maxReached) < 1000 * 60 *60 *24){
    formated = formatDuration(maxReached, {locale:es, format: ['days', 'hours']})
  } else{
    formated = formatDuration(maxReached, {locale:es, format: ['years','months', 'days']})
  }
}
  return formated
}


const isStop = props.card.cardType.type === ECardsType.STOP
useEffect(() => {
  const intervalId = setInterval(() => {
  const timer:Duration = intervalToDuration({
    start: parseISO(startTime || props.card.createdAt),
     end : new Date()
   })
      
      
      setYears(timer.years || 0)
      setMonths(timer.months || 0)
      setDays(timer.days || 0)
      setHours(timer.hours || 0)
      setMinutes(timer.minutes || 0)
      setSeconds(timer.seconds || 0)
      setCircularBar(timer.seconds || 0)
      setPercentBar((prev) => {
        const miliGoal = milliseconds(goal)
        const miliCurrent = milliseconds(timer)
        if(prev >= 100){
          return 100
        }
        return (miliCurrent / miliGoal) * 100
      })
      
      setmaxReached((prev)=>{
        let maxReachedUpdated:Duration
        if(prev){
             milliseconds(timer) < milliseconds(prev) ? maxReachedUpdated = prev : maxReachedUpdated = timer
        } else{
          maxReachedUpdated = timer
        }
        return maxReachedUpdated
      })

  }, 1000);

  return () => {
    clearInterval(intervalId);
  }
}, [props.card.createdAt, goal, startTime]);


const prettyCratedAT = parseISO(props.card.createdAt)

  return (
    <article className="">
        <div className="card-header">
          <div className='card-title'>{props.card.title}</div>
          <span onClick={async ()=>{
              try{                    
                const response = await fetcher({url: `${urls.deleteCard}/${props.card._id}`, options:{
                  method:'DELETE',
                  headers:{
                      "Content-Type": "application/json",
                  }
                }})

                if (typeof response === 'string') {
                  throw new Error(response)
                }else{
                 props.updateCards((prev:number) => {
                  return prev + 1
                 })
                }
                
              }catch(error){
                if (error instanceof Error) { 
                  errorState.addError(error.message)
                }else if (typeof error === 'string'){
                    errorState.addError(error)
                }
              
      }
          }} className='bi bi-three-dots card-menu'></span>
        </div>
        <div className="card-body">
          <div className='innerBody'>
            {isStop 
            ? <div className='timer-hoursMinutes-container'>
              <div className='timer-hoursMinutes'>
              <CircularProgressbar value={circularBar} maxValue={60} />
                <div>
                  <span className='hoursMinutes'>{`${hours}:${minutes}`}</span>
              </div>
            </div> 
            </div> 
            : <div className='timer-checkDays'></div>
            }
            <div className='right-info'>
              <div className='total'>
                <p>Total Alcanzado</p>
                <div className='progression-total'>
                  <p className='inner-progression-text'>{`${years}A`}<span className='separator'></span></p>
                  <p className='inner-progression-text'>{`${months}M`}<span className='separator'></span></p>
                  <p className='inner-progression-text'>{`${days}D`}</p>
                </div>
              </div>
              <div className='current-goal'>
                <p>Meta actual <span>{formatDuration(goal, {locale:es})}</span></p>
                <div className='progression-goal'>
                  <ProgressBar animated  now={percentBar}  label={`${percentBar.toFixed(0)}% completed`} />              
                </div>
                <div className='streak'>
                    <p> Racha <i className='bi bi-star-fill'></i>
                    <i className='bi bi-star-fill star'></i>
                    <i className='bi bi-star-fill star'></i>
                    <i className='bi bi-star-fill star'></i>
                    <i className='bi bi-star-fill star'></i></p>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-buttons">
          <div className='play-stop'>
          <div onClick={async ()=>{
                   setYears(0)
                   setMonths(0)
                   setDays(0)
                   setHours(0)
                   setMinutes(0)
                   setSeconds(0)

                   
                   try{      
                    const propertiesToPatch = {
                      StarTime: formatISO(new Date()),
                      maxReached
                    }
                      
                    const response = await fetcher({url: `${urls.updateCard}/${props.card._id}`, options:{
                      method:'PATCH',
                      headers:{
                          "Content-Type": "application/json",
                      },
                      body:JSON.stringify(propertiesToPatch)
                    }})

                    if (typeof response === 'string') {
                      throw new Error(response)
                    }else{
                      setStartTime(formatISO(new Date()))
                      props.updateCards((prev:number) => {
                        return prev + 1
                       })
                    }
                    
                  }catch(error){
                    if (error instanceof Error) { 
                      errorState.addError(error.message)
                    }else if (typeof error === 'string'){
                        errorState.addError(error)
                    }
                  
          }
          }
          } 
          className='stop'
          >
            <i className='bi bi-stop stop-icon'></i></div>
                <p>Máximo logro: <span>
                  {
                  
                  (maxReached && maxReachedFromated())

                  }
                  </span></p>
          </div>
          <div className='statistics'><i className='bi bi-bar-chart statistics-icon'></i></div>
        </div>
        <p className="card-footer">{`creado - ${format(prettyCratedAT, 'dd/MM/yy')}`}
        </p>
    </article>
  )
}
