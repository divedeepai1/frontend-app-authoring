import HeaderTop from "../../header";
import { Header } from "../components/header";
import { ManagementSection } from "../components/management-section";
import { Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";
import { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Get email and name from URL params or location state
    const email = location.state?.email || "";
    const name = location.state?.name || "";
    setRecipientEmail(email);
    setRecipientName(name);
    
    // Get current user email from session or config
    const currentUser = sessionStorage.getItem("userEmail") || getConfig().LOGGED_IN_USER_EMAIL || "";
    setCurrentUserEmail(currentUser);
    
    if (email) {
      fetchChatHistory(email);
    }
  }, [location]);

  const fetchChatHistory = async (email) => {
    setIsLoading(true);
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/chat/history/?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get chat history: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      // Sort messages by timestamp in ascending order (oldest first)
      const sortedMessages = (result?.messages || []).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !recipientEmail) return;

    setIsSending(true);
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/chat/send/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({
            email: recipientEmail,
            message: message.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }

      // Refresh chat history after sending
      await fetchChatHistory(recipientEmail);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <HeaderTop isHiddenMainMenu />
      <div className="min-vh-100 bg-white">
        <Header
          heading="Manage Classes & Students"
          bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"
          color="white"
          outline="outline-white-button"
        />
        <ManagementSection />
        <section className="px-5">
          <Container>
            <div className="py-4 mb-4" style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
              <div className="p-4 class-div-style-2">
                {/* Header with back button and recipient info */}
                <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                  <button
                    className="btn p-0 mr-3"
                    onClick={handleBack}
                    style={{ 
                      background: "none", 
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    <ArrowLeft className="w-5 h-5" color="#255A71" />
                  </button>
                  <div>
                    <h4 className="primary-text mb-0">Chat with {recipientName}</h4>
                    <p className="text-muted mb-0 small">{recipientEmail}</p>
                  </div>
                </div>

                {/* Chat area */}
                <div 
                  className="border rounded mb-3 p-3" 
                  style={{ 
                    height: "400px", 
                    overflowY: "auto",
                    backgroundColor: "#F9FAFB"
                  }}
                >
                  {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center h-80">
                      <div className="text-muted">Loading messages...</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="d-flex justify-content-center align-items-center h-80">
                      <div className="text-muted text-center">
                        <p>No messages yet</p>
                        <p className="small">Start the conversation by sending a message</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((msg, idx) => {
                        // Determine if message is from recipient (received) or from current user (sent)
                        const isFromRecipient = msg.sender?.email === recipientEmail;
                        const isSent = !isFromRecipient;
                        
                        return (
                          <div
                            key={msg.id || idx}
                            className={`d-flex ${isSent ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                          >
                            <div
                              className="rounded p-3 text-gray-800"
                              style={{ 
                                maxWidth: "70%", 
                                wordWrap: "break-word",
                                backgroundColor: isSent ? "#E3F2FD" : "#F5F5F5"
                              }}
                            >
                              <p className="mb-1 small" style={{ marginBottom: "4px" }}>{msg.text}</p>
                              {msg.timestamp && (
                                <p className={`mb-0 text-muted small`} style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                  {new Date(msg.timestamp).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage}>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{
                        border: "1px solid #6B7280",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      type="submit"
                      className="primary-button d-flex align-items-center px-4 py-2"
                      disabled={!message.trim() || isSending}
                      style={{
                        minWidth: "100px",
                      }}
                    >
                      {isSending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="mr-2" size={25} />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
};

export default Chat;


