
import { Container} from "react-bootstrap"
import ActivityFeed from "../components/student-feed/acitivity-feed"
import NewsNotices from "../components/student-feed/news-notice"

function Feed() {
  return (
    <section className="py-3 px-5">
    <Container className="d-flex">
         <div style={{width:"70%"}}>
         <ActivityFeed />
         </div>
          <div className="ml-5" style={{width:"30%"}}>
          <NewsNotices />
          </div>
    </Container>
    </section>
  )
}

export default Feed
