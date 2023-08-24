import BottomNav from "../BottomNav/BottomNav";
import BodyCard from "../Cards/BodyCard";


export default function BodyApp() {
  return (
    <div className='container col-12 d-flex justify-content-end align-items-center flex-column mb-5'>
    <BodyCard/>
    <BottomNav/>
    </div>
  )
}
