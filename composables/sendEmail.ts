export async function sendEmail(): Promise<any> {
    const config = useRuntimeConfig();
    const url = `${config.public.default_api_url}`;

    try {
        const response = await $fetch(url);
        return response;
    }catch(error){
        console.error('Error sending form:', error);
        return Promise.reject(error);
    }
}