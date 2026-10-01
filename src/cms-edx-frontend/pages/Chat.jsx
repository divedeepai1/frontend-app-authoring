import HeaderTop from "../../header";
import { Header } from "../components/header";
import { ManagementSection } from "../components/management-section";
import { Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";
import { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft, Edit as EditIcon, X as CloseIcon, Check as CheckIcon } from "lucide-react";

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
  const chatContainerRef = useRef(null);
  const textAreaRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

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

  // Poll chat history every 3 seconds for near real-time updates
  useEffect(() => {
    if (!recipientEmail) return;
    const intervalId = setInterval(() => {
      fetchChatHistory(recipientEmail, { silent: true });
    }, 3000);
    return () => clearInterval(intervalId);
  }, [recipientEmail]);

  const fetchChatHistory = async (email, { silent = false } = {}) => {
    if (!silent) setIsLoading(true);
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/chat/history/?email=${encodeURIComponent(email)}&limit=30`,
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
      if (!silent) setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !recipientEmail) return;

    setIsSending(true);
    const token = await fetchCsrfToken();
    // Optimistic UI update
    const optimistic = {
      id: `temp-${Date.now()}`,
      sender: { email: currentUserEmail },
      text: message.trim(),
      timestamp: new Date().toISOString(),
      edited: false,
      __optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    const sentText = message.trim();
    setMessage("");
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
            message: sentText,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }
      // Silent refresh to reconcile without wiping UI
      fetchChatHistory(recipientEmail, { silent: true });
    } catch (error) {
      console.error("Error sending message:", error.message);
      // Revert optimistic if failed
      setMessages((prev) => prev.filter((m) => m !== optimistic));
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (autoScrollEnabled && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, autoScrollEnabled]);

  // Auto-resize textarea
  const autoResize = () => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const max = 160; // px
    el.style.height = Math.min(el.scrollHeight, max) + 'px';
  };
  useEffect(() => {
    autoResize();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const startEditMessage = (msg) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.text || "");
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEditMessage = async () => {
    if (!editingMessageId || !editingText.trim()) return;
    const token = await fetchCsrfToken();
    try {
      const res = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/chat/edit/${encodeURIComponent(editingMessageId)}/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({ text: editingText.trim() }),
        }
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed to edit: ${res.status} ${t}`);
      }
      setMessages((prev) => prev.map((m) => (m.id === editingMessageId ? { ...m, text: editingText.trim(), edited: true } : m)));
      cancelEditMessage();
    } catch (e) {
      console.error("edit error", e);
    }
  };

  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const threshold = 40;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setAutoScrollEnabled(atBottom);
  };

  return (
    <div>
      <HeaderTop isHiddenMainMenu />
      <div className="min-vh-100 bg-white">
        <Header
          heading="Manage Classes, Students, and Assign Courses"
          bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"
          color="white"
          outline="outline-white-button"
        />
        <ManagementSection />
        <section className="px-5 bg-white">
          <Container>
            <div className="py-1  bg-white mb-4" style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
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
                  ref={chatContainerRef}
                  onScroll={handleChatScroll}
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
                            <div style={{ maxWidth: "70%" }}>
                              <div
                                className="rounded p-3 text-gray-800"
                                style={{ 
                                  wordWrap: "break-word",
                                  backgroundColor: isSent ? "#E3F2FD" : "#F5F5F5"
                                }}
                              >
                                {editingMessageId === msg.id ? (
                                  <div>
                                    <textarea
                                      className="form-control mb-2"
                                      rows={3}
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                                          e.preventDefault();
                                          saveEditMessage();
                                        }
                                      }}
                                      style={{ resize: 'vertical' }}
                                    />
                                    <div className="d-flex justify-content-end gap-2">
                                      <button
                                        type="button"
                                        onClick={cancelEditMessage}
                                        title="Cancel edit"
                                        className="btn btn-link p-1"
                                        style={{ border: 'none', background: 'none', color: '#6B7280' }}
                                      >
                                        <CloseIcon size={18} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={saveEditMessage}
                                        title="Save edit"
                                        className="btn btn-link p-1"
                                        style={{ border: 'none', background: 'none', color: '#255A71' }}
                                      >
                                        <CheckIcon size={18} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="mb-1 small" style={{ marginBottom: "4px" }}>{msg.text}</p>
                                    <div className="d-flex align-items-center justify-content-between">
                                      {msg.timestamp && (
                                        <p className={`mb-0 text-muted small`} style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                          {new Date(msg.timestamp).toLocaleString()} {msg.edited ? '(edited)' : ''}
                                        </p>
                                      )}
                                      {isSent && (
                                        <button
                                          type="button"
                                          className="btn btn-link p-0 ml-2"
                                          onClick={() => startEditMessage(msg)}
                                          title="Edit message"
                                          style={{ color: '#255A71' }}
                                        >
                                          <EditIcon size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
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
                    <textarea
                      ref={textAreaRef}
                      className="form-control p-2"
                      placeholder="Type your message... (Enter to send, Shift+Enter or Ctrl+Enter for new line)"
                      rows={1}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        autoResize();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey)) {
                          return; // allow newline
                        }
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      style={{
                        border: "1px solid #6B7280",
                        borderRadius: "4px",
                        padding: '6px 8px',
                        lineHeight: 1.4,
                        resize: 'none',
                        overflow: 'hidden',
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


