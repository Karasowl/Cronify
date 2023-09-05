import { useState, useEffect } from 'react';
import * as Types from "./../types"

const useFetch = (url:string, options:Types.IFetchOptions) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setData(data);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error){

            setError(error.message)
        }
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, error, isLoading };
};

export default useFetch;
