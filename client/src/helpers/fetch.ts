import * as Types from "./../types"

 export async function fetcherGET({url}:Types.IFetchOptions) {
    try {

      const response = await fetch(url)
      return response

    } catch(err){

      console.log(`Dessde el fetchGET:${err}`)
      return err
      
    }
  }

 export async function fetcherPOST({url, options}:Types.IFetchOptions) {
    try {

      const response = await fetch(url, options)
      console.log(response)
      return response

    } catch(err){

      console.log(`Dessde el fetchPost:${err}`)
      return err
      
    }
  }



  