import { deleteUser } from "aws-amplify/auth";
import { fetchUserAttributes } from "aws-amplify/auth";

const isVisibleAttributes = ref<boolean>(false);
const isVisibleDelete = ref<boolean>(false);
const result = ref({});

export async function handleDeleteUser() {
    try {
        await deleteUser();
    } catch (error) {
        console.log(error);
    }
}

export function setAttributesVissible() {
    
    if (isVisibleAttributes.value) {
        isVisibleAttributes.value = false;  
    } else {
        isVisibleAttributes.value = true;  
        isVisibleDelete.value = false;    
    }
}

export function getAttributesVissible() {
    return isVisibleAttributes.value;
}

export async function setAttributes() {
    await setAttributesVissible();        
    result.value = await fetchUserAttributes(); 
}

export function getAttributes() {
    return result.value;
}

export function setDeleteVissible() {
    if (isVisibleDelete.value) {
        isVisibleDelete.value = false; 
    } else {
        isVisibleDelete.value = true;  
        isVisibleAttributes.value = false; 
    }
}

export function getDeleteVissible() {
    return isVisibleDelete.value;
}

export async function setDelete() {
    await setDeleteVissible();          
}
