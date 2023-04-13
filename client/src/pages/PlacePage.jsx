import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "../AddressLink";


const exampleReviews = [
  {
    author: "John Doe",
    rating: 5,
    text: "Working with Jeff was a great experience, he’s professional while at the same time able to make you feel comfortable to perform your music in front of him."
  },
  {
    author: "Jane Smith",
    rating: 4,
    text: "The recording process went very smoothly and allowed me to finally get a good sound behind the words I wrote down. I would definitely recommend using Jeff’s services and being open about what you need from him."
  },
  {
    author: "Mark Johnson",
    rating: 5,
    text: "I’ve recorded at Warm Glow Studios multiple times, and he’s been amazing. The environment is ideal for working. However, the audio engineer could have communicated a little bit better."
  },
  {
    author: "Emily Brown",
    rating: 4,
    text: "Jeff has a great ear for detail, and his suggestions helped improve my song immensely. The studio is cozy and welcoming, making it easy to focus on creating music."
  },
  {
    author: "Michael Rodriguez",
    rating: 5,
    text: "I had a fantastic experience at Warm Glow Studios. Jeff was patient and provided valuable feedback that enhanced my recordings. I'm looking forward to my next session!"
  },
  {
    author: "Sophia Davis",
    rating: 4,
    text: "The equipment and software at Warm Glow Studios are top-notch, making the recording process smooth and efficient. Jeff's expertise was invaluable in producing a high-quality final product."
  },
  {
    author: "David Johnson",
    rating: 5,
    text: "Warm Glow Studios has a professional yet relaxed atmosphere that made my recording experience enjoyable. Jeff was incredibly helpful, providing insights and tips that improved my performance."
  },
];




export default function PlacePage() {
  const {id} = useParams();
  const [place,setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`/api/places/${id}`).then(response => {
      setPlace(response.data);
      setIsLoading(false);
    });
  }, [id]);

  if (!place) return '';



  return (
    <div className="mt-4 bg-black -mx-8 px-8 pt-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : 
      (
        <div className="">
          <h1 className="text-3xl text-white">{place.title}</h1>
          <AddressLink className="text-white">{place.address}</AddressLink>
          <PlaceGallery place={place} />
          <div className="mt-10 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
            <div>
              <div className="my-4 text-white">
                <h2 className="font-semibold text-2xl">Description</h2>
                <div className="text-white mt-8">{place.description}</div>
              </div>
              {/* Check-in: {place.checkIn}<br />
              Check-out: {place.checkOut}<br /> */}
              {/* <div className="text-white mt-8">Max number of guests: {place.maxGuests}</div> */}
              <div className="my-4 text-white">
                <h2 className="font-semibold text-2xl">Reviews</h2>
                {exampleReviews.map((review, index) => (
                  <div key={index} className="bg-white text-black p-4 my-4 rounded-md">
                    <div className="font-semibold">{review.author}</div>
                    <div className="text-primary">Rating: {review.rating}</div>
                    <p className="mt-2">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <BookingWidget place={place} />
            </div>
          </div>
          
      </div>
      )}
    </div>
  );
}
