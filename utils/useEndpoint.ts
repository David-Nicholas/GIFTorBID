// useEndpoint.ts
export function useEndpoint() {
    const config = useRuntimeConfig().public;
  
    const createHeaders = (token?: string): Record<string, string> => {
      return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
    };
  
    const parseResponse = async (res: Response) => {
      const data = await res.json();
      return JSON.parse(data.body);
    };
  
    async function getOrderByListingID({ listingID, userID, token }: { listingID: string; userID: string; token: string }) {
      const res = await fetch(`${config.api_url}/user/orders?orderID=${listingID}&userID=${userID}`, {
        method: 'GET',
        headers: createHeaders(token),
      });
      return parseResponse(res);
    }
  
    async function createOrder({ listingID, sellerEmail, redeemerEmail, sub, token }: any) {
      const body = JSON.stringify({ listingID, sellerEmail, redeemerEmail, sub });
      const res = await fetch(`${config.api_url}/user/orders`, {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify({ body }),
      });
      return res.ok;
    }
  
    async function createReview({ writerEmail, listingID, message, rating, sub, token }: any) {
      const body = JSON.stringify({ writerEmail, listingID, message, rating, sub });
      const res = await fetch(`${config.api_url}/user/review`, {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify({ body }),
      });
      return res.ok;
    }
  
    async function getUserReviews({ email, token }: { email: string; token?: string }) {
      const res = await fetch(`${config.api_url}/user/review?userEmail=${email}`, {
        method: 'GET',
        headers: createHeaders(token),
      });
      return parseResponse(res);
    }
  
    async function bidOnItem({ listingID, bidAmount, sub, bidderEmail, name, token }: any) {
      const body = JSON.stringify({ listingID, bidAmount, sub, bidderEmail, name });
      const res = await fetch(`${config.api_url}/listings/listing/auction`, {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify({ body }),
      });
      return res.ok;
    }
  
    async function getListingByID(id: string) {
      const res = await fetch(`${config.api_url}/listings/listing?listingID=${id}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      return parseResponse(res);
    }
  
    async function getUserInformations({ userID, token }: { userID: string; token: string }) {
      const res = await fetch(`${config.api_url}/user/informations?userID=${userID}`, {
        method: 'GET',
        headers: createHeaders(token),
      });
      return parseResponse(res);
    }
  
    async function updateUserInformations({ userID, token, ...rest }: any) {
      const body = JSON.stringify({ userID, ...rest });
      const res = await fetch(`${config.api_url}/user/informations`, {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify({ body }),
      });
      return res.ok;
    }
  
    async function submitListing({ listingData, token }: { listingData: any; token: string }) {
      const res = await fetch(`${config.api_url}/user/listings/listing`, {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify({ body: JSON.stringify(listingData) }),
      });
      return res.ok;
    }
  
    async function fetchDonations() {
      const res = await fetch(`${config.api_url}/listings/donations`, {
        method: 'GET',
        headers: createHeaders(),
      });
      return parseResponse(res);
    }
  
    async function fetchAuctions() {
      const res = await fetch(`${config.api_url}/listings/auctions`, {
        method: 'GET',
        headers: createHeaders(),
      });
      return parseResponse(res);
    }
  
    async function fetchHomeListings() {
      const res = await fetch(`${config.api_url}/listings`, {
        method: 'GET',
        headers: createHeaders(),
      });
      return await res.json();
    }
  
    async function getUserMessages({ userID, token }: { userID: string; token: string }) {
      const res = await fetch(`${config.api_url}/user/messages?userID=${userID}`, {
        method: 'GET',
        headers: createHeaders(token),
      });
      return parseResponse(res);
    }
  
    async function supportMessage(payload: { name: string; email: string; subject: string; bodyText: string }) {
      return await $fetch(`${config.api_url}/support`, {
        method: 'POST',
        body: payload,
      });
    }
  
    return {
      getOrderByListingID,
      createOrder,
      createReview,
      getUserReviews,
      bidOnItem,
      getListingByID,
      getUserInformations,
      updateUserInformations,
      submitListing,
      fetchDonations,
      fetchAuctions,
      fetchHomeListings,
      getUserMessages,
      supportMessage,
    };
  }