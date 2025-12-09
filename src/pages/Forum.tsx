import { Routes, Route } from "react-router-dom";
import { ForumHome } from "@/components/forum/ForumHome";
import { CommunityView } from "@/components/forum/CommunityView";
import { PostView } from "@/components/forum/PostView";

const Forum = () => {
  return (
    <Routes>
      <Route path="/" element={<ForumHome />} />
      <Route path="/community/:communityId" element={<CommunityView />} />
      <Route path="/post/:postId" element={<PostView />} />
    </Routes>
  );
};

export default Forum;
