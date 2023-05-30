import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    // useRef stores the value and it doesn't change over re-render cycles
    const activeHttpRequest = useRef([]);

    // useCallback will remove the dependency of function to run when the component calling it re-renders to specified dependencies that we pass in the array [].
    const sendRequest = useCallback(
        async (url, method="GET", body=null, headers={}) => {
            setIsLoading(true);

            // modern day browsers have this property to stop any ongoing request
            const httpAbortCtrl = new AbortController();
            activeHttpRequest.current.push(httpAbortCtrl);
            
            try {
                const response = await fetch(url, {
                    method,
                    body,
                    headers,
                    // through below line we can connect the abort controller to this request and thus we now have the ability to cancel this request
                    signal: httpAbortCtrl.signal
                });

                // if the current request is completed then we don't need to abort it, since now it's completed therefore we remove it from the activeHttpRequest array
                activeHttpRequest.current = activeHttpRequest.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl);

                const responseData = await response.json();
                // if the status code is 4xx or 5xx then this if block will execute
                if(!response.ok) {
                    throw new Error(responseData.message);
                }
                setIsLoading(false);
                return responseData;
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
                throw err;
            }

        }
    , []);

    // the return function in useeffect only run's before the next time useEffect is being executed or after the component that rendered it unmounts
    useEffect(() => {
        return () => {
            activeHttpRequest.current.forEach(abortCtrl => abortCtrl.abort());
        }
    }, [])

    const clearError = () => {
        setError(null);
    }

    return {isLoading, error, sendRequest, clearError};
}