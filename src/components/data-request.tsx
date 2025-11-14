import { useState, useEffect } from "react";
import styles from "../styles/data-request.module.css";
import { FaBoxOpen, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";
import { dataRequestAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function DataRequest() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [userRequests, setUserRequests] = useState<any[]>([]);

  const dataOptions = [
    {
      id: 1,
      type: 'orders' as const,
      icon: <FaBoxOpen className={styles.icon} style={{ color: "#f97316" }} />,
      title: "Your Orders",
      description:
        "This file contains information about your account's physical and digital order history such as product names, delivery addresses, delivery dates, prices paid, billing information, invoices you have received from Sixpine and returns you have made.",
    },
    {
      id: 2,
      type: 'addresses' as const,
      icon: <FaMapMarkerAlt className={styles.icon} style={{ color: "#ef4444" }} />,
      title: "Your Addresses",
      description:
        "This file contains the billing and delivery addresses you have added to your Sixpine account, along with delivery instructions and preferences (e.g., 'no delivery on Saturday'), you have given to.",
    },
    {
      id: 3,
      type: 'payment_options' as const,
      icon: <FaCreditCard className={styles.icon} style={{ color: "#0ea5e9" }} />,
      title: "Payment Options",
      description:
        "This file contains payment information such as details relating to payment instruments you have added or debit cards you have added to your Wallet, gift card information such as the balance, details relating to your use of Sixpine Wallet on third-party sites including the card you used, the amount you paid and the name of the online shop you bought from.",
    },
  ];

  useEffect(() => {
    // Wait for auth state to load before checking
    if (state.loading) {
      return; // Still loading, wait
    }
    
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchUserRequests();
  }, [state.isAuthenticated, state.loading]);

  const fetchUserRequests = async () => {
    try {
      const response = await dataRequestAPI.getUserRequests();
      if (response.data.success) {
        setUserRequests(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmitRequest = async (requestType: 'orders' | 'addresses' | 'payment_options', itemId: number) => {
    if (!state.isAuthenticated) {
      alert('Please login to request your data');
      navigate('/login');
      return;
    }

    try {
      setLoading({ ...loading, [itemId]: true });
      const response = await dataRequestAPI.createRequest(requestType);
      
      if (response.data.success) {
        alert('Request submitted successfully! You will be notified once it is approved.');
        fetchUserRequests();
      } else {
        alert(response.data.error || 'Failed to submit request');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to submit request';
      alert(errorMsg);
    } finally {
      setLoading({ ...loading, [itemId]: false });
    }
  };

  const getRequestStatus = (itemType: string) => {
    // Only get active requests (pending, approved, rejected)
    // Completed requests are ignored so user can request again
    const requests = userRequests.filter(r => r.request_type === itemType);
    const activeRequest = requests.find(r => r.status !== 'completed');
    if (!activeRequest) return null;
    return activeRequest.status;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending Approval',
      'approved': 'Approved - Ready to Download',
      'rejected': 'Rejected',
      'completed': 'Completed - Ready to Download'
    };
    return statusMap[status] || status;
  };

  return (
    <div className={styles.Datacontainer}>
      <h2 className={styles.heading}>Request your data</h2>
      <p className={styles.subtext}>
        Please select the data that you want.
      </p>

      <div className={styles.cardList}>
        {dataOptions.map((item) => {
          const status = getRequestStatus(item.type);
          const isPending = status === 'pending';
          const isApproved = status === 'approved' || status === 'completed';
          
          return (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardContent}>
              {item.icon}
              <div className={styles.textContent}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
                  {status && (
                    <p style={{ 
                      marginTop: '10px', 
                      fontSize: '14px', 
                      fontWeight: 600,
                      color: status === 'approved' || status === 'completed' ? '#067d62' : 
                             status === 'rejected' ? '#ef4444' : '#f59e0b'
                    }}>
                      Status: {getStatusText(status)}
                    </p>
                  )}
                </div>
              </div>
              {isApproved ? (
                <button 
                  onClick={async () => {
                    const request = userRequests.find(r => r.request_type === item.type);
                    if (request) {
                      try {
                        const response = await dataRequestAPI.downloadFile(request.id);
                        // Create blob and download
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `data_export_${request.request_type}_${request.id}.xlsx`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                        // After download, delete the completed request so user can request again
                        try {
                          // The request status is now 'completed', we'll allow new requests
                          // Refresh to update UI
                          await fetchUserRequests();
                        } catch (err) {
                          console.error('Error refreshing requests:', err);
                        }
                      } catch (error: any) {
                        alert(error.response?.data?.error || 'Failed to download file');
                      }
                    }
                  }}
                  style={{ 
                    backgroundColor: '#067d62',
                    color: '#ffffff',
                    fontWeight: 600,
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '150px',
                    textAlign: 'center',
                    flexShrink: 0,
                    marginTop: '20px',
                    transition: 'background 0.2s, color 0.2s'
                  }}
                >
                  Download
                </button>
              ) : (
                <button 
                  className={styles.requestBtn}
                  onClick={() => handleSubmitRequest(item.type, item.id)}
                  disabled={loading[item.id] || isPending}
                  style={{ 
                    opacity: (loading[item.id] || isPending) ? 0.6 : 1,
                    cursor: (loading[item.id] || isPending) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading[item.id] ? 'Submitting...' : isPending ? 'Request Pending' : 'Submit Request'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
