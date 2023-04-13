import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "../AddressLink";

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
              <div className="text-white mt-8">Max number of guests: {place.maxGuests}</div>
            </div>
            <div>
              <BookingWidget place={place} />
            </div>
          </div>
          {/* <div className="bg-white -mx-8 px-8 py-8 border-t">
            <div>
              <h2 className="font-semibold text-2xl">Extra info</h2>
            </div>
            <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">{place.extraInfo}</div>
          </div> */}
      </div>
      )}
    </div>
  );
}
