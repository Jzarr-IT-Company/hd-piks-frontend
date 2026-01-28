import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../Services/user';

function UserData() {
  const fetchUserData = async () => {
    const response = await getAllUsers();
    if (Array.isArray(response)) {
      return response;
    }
    console.error('Expected an array but got:', response);
    return [];
  };
  return useQuery({
    queryKey: ['users'],       
    queryFn: fetchUserData,      
    staleTime: Infinity,          
    cacheTime: 1000 * 60 * 60 * 24,   
    enabled: true,               
    refetchOnWindowFocus: false,   
    refetchOnReconnect: false,     
    onError: (error) => {
      console.error('Error fetching user data:', error);
    },
    onSuccess: (data) => {
      console.log('Fetched user data:', data);
    },
    retry: 3,                    
    retryDelay: 1000,              
  });
}

export default UserData;
