import {useContext, useEffect, useState} from "react";
import {differenceInCalendarDays} from "date-fns";
import axios from "axios";
import {Navigate} from "react-router-dom";
import {UserContext} from "./UserContext.jsx";

export default function BookingWidget({place}) {
  const [checkIn,setCheckIn] = useState('');
  const [checkOut,setCheckOut] = useState('');
  const [numberOfGuests,setNumberOfGuests] = useState(1);
  const [numberOfHours,setNumberOfHours] = useState(1);
  const [name,setName] = useState('');
  const [phone,setPhone] = useState('');
  const [redirect,setRedirect] = useState('');
  const {user} = useContext(UserContext);
  const [selectedTime, setSelectedTime] = useState("09:00");


  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  // let numberOfNights = 0;
  // if (checkIn && checkOut) {
  //   numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
  // }

  async function bookThisPlace() {
    const response = await axios.post('/api/bookings', {
      checkIn,selectedTime,numberOfHours,name,phone,
      place:place._id,
      price:numberOfHours * place.price,
    });
    const bookingId = response.data._id;
    setRedirect(`/account/bookings/${bookingId}`);
  }
  
  

  const generateTimeOptions = () => {
    const options = [];

    for (let hour = 9; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        options.push(<option key={time} value={time}>{time}</option>);
      }
    }

    return options;
  }

  if (redirect) {
    return <Navigate to={redirect} />
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">
        Price: ${place.price} / per hour
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex flex-col">
          <div className="py-3 px-4 flex flex-col">
            <label>Date:</label>
            <input type="date"
                   value={checkIn}
                   onChange={ev => setCheckIn(ev.target.value)}/>
          </div>
          <div className="py-3 px-4 border-t flex flex-col bg-white">
            <label>Time:</label>
            <select
              value={selectedTime}
              onChange={ev => setSelectedTime(ev.target.value)}
              className="bg-white"
            >
              {generateTimeOptions()}
            </select>
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>How many hours:</label>
          <input type="number"
                 value={numberOfHours}
                 onChange={ev => setNumberOfHours(ev.target.value)}/>
        </div>

        {(
          <div className="py-3 px-4 border-t">
            <label>Your full name:</label>
            <input type="text"
                   value={name}
                   onChange={ev => setName(ev.target.value)}/>
            <label>Phone number:</label>
            <input type="tel"
                   value={phone}
                   onChange={ev => setPhone(ev.target.value)}/>
          </div>
        )}
      </div>
      <div>{selectedTime}</div>
      <button onClick={bookThisPlace} className="primary mt-4">
        Book this place
        {numberOfHours > 0 && (
          <span> ${numberOfHours * place.price}</span>
        )}
      </button>
    </div>
  );
}