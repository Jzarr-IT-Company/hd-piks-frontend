// import "bootstrap/dist/css/bootstrap.min.css";
// import React from "react";
// import Cookies from "js-cookie";
// import {
//   createBrowserRouter,
//   RouterProvider,
//   Navigate,
//   useLocation,
//   Outlet,
// } from "react-router-dom";
// import CircularProgress from "@mui/material/CircularProgress";
// import AdminLogin from "../Admin/pages/Login";
// import AdminDashboard from "../Admin/pages/Dashboard";
// import CategoriesPage from "../Admin/pages/Categories";
// import UsersPage from "../Admin/pages/Users";
// import CreatorsPage from "../Admin/pages/Creators";
// import ImagesPage from "../Admin/pages/Images";
// import AnalyticsPage from "../Admin/pages/Analytics";
// import AdminSidebar from "../Admin/components/Sidebar";
// import AdminTopbar from "../Admin/components/Topbar";
// import NotFound from "../Pages/NotFound"; // Adjust the path if needed
// // import CategoryDetail from '../Pages/CategoryDetail';
// import WordpressBlogRedirect from "../Pages/WordpressBlogRedirect";
// import AiToolPage from "../Pages/AiToolPage"; // NEW
// // Admin Protected Route
// function AdminProtectedRoute({ children }) {
//   const isAdmin = !!Cookies.get("token");
//   return isAdmin ? children : <Navigate to="/admin/login" />;
// }

// // Admin Layout
// function AdminLayout() {
//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       <AdminSidebar />
//       <div style={{ flex: 1 }}>
//         <AdminTopbar />
//         <div style={{ padding: 24 }}>
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// }
// import HomePage from "../Pages/HomePage";
// import Dashboard from "../Pages/Dashboard";
// import PricingPlan from "../Pages/PricingPlan";
// import Login from "../Pages/Login";
// import Signup from "../Pages/Signup";
// import Member from "../Pages/Member";
// import Contactus from "../Pages/Contactus";
// import Sidebar from "../Components/Sidebar/Sidebar";
// import MemberDetail from "../Pages/MemberDetail";
// import Upload from "../Pages/Upload";
// import Profile from "../Pages/Profile";
// import Collections from "../Pages/Collections";
// import CollectionDetail from "../Pages/CollectionDetail";
// import UnderRevision from "../Pages/UnderRevision";
// import Rejections from "../Pages/Rejections";
// import Published from "../Pages/Published";
// import TermsAndConditions from "../Pages/TermsAndConditions";
// import VideoPage from "../Pages/VideoPage";
// // import BlogsList from '../Pages/BlogsList';
// import AdminBlogs from "../Admin/pages/Blogs";
// // import BlogCategories from '../Admin/pages/BlogCategories';
// import BlogsPage1 from "../Pages/BlogsPage1";
// import BlogsPage2 from "../Pages/BlogsPage2";
// import BlogsPage3 from "../Pages/BlogsPage3";
// import BlogsPage4 from "../Pages/BlogsPage4";
// import AdminCollectionsPageWrapper from "../Admin/Pages/AdminCollectionsPage";
// // import BlogDetail from '../Pages/BlogDetail';
// import Setting from "../Pages/Setting";
// import Search from "../Pages/SearchPage";
// import AssetDetail from "../Pages/AssetDetail";
// import { useGlobalState } from "../Context/Context";

// import AboutUs from '../Pages/Company/AboutUs';
// import ContactUs from '../Pages/Company/ContactUs';
// import Faq from '../Pages/Company/Faq';
// import Terms from '../Pages/Company/Terms';
// import Privacy from '../Pages/Company/Privacy';

// function ProtectedRoute({ children }) {
//   const token = Cookies.get("token");
//   const location = useLocation();

//   if (!token) {
//     return <Navigate to="/login" replace state={{ from: location.pathname }} />;
//   }

//   return children;
// }

// function ProtectedCreatorRoute({ children }) {
//   const token = Cookies.get("token");
//   const location = useLocation();
//   const { userData, creatorData } = useGlobalState();

//   if (!token) {
//     return <Navigate to="/login" replace state={{ from: location.pathname }} />;
//   }

//   const creatorUserId = creatorData?.userId?._id || creatorData?.userId;
//   const userCreatorId = userData?.creatorId?._id || userData?.creatorId;

//   const belongsToUser =
//     creatorData &&
//     userData &&
//     ((creatorUserId &&
//       userData._id &&
//       `${creatorUserId}` === `${userData._id}`) ||
//       (userCreatorId &&
//         creatorData._id &&
//         `${userCreatorId}` === `${creatorData._id}`));

//   const isLoading = creatorData === undefined || !userData?._id;
//   if (isLoading) {
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "100vh" }}
//       >
//         <CircularProgress />
//       </div>
//     );
//   }

//   const isApprovedCreator = creatorData?.status === "approved" && belongsToUser;
//   if (!isApprovedCreator) {
//     return (
//       <Navigate
//         to="/profile"
//         replace
//         state={{ from: location.pathname, reason: "creator-required" }}
//       />
//     );
//   }

//   return children;
// }

// function Routing() {
//   const router = createBrowserRouter([
//     // Admin routes
//     {
//       path: "/admin/login",
//       element: <AdminLogin />,
//     },
//     {
//       path: "/admin",
//       element: (
//         <AdminProtectedRoute>
//           <AdminLayout />
//         </AdminProtectedRoute>
//       ),
//       children: [
//         { path: "", element: <AdminDashboard /> },
//         { path: "categories", element: <CategoriesPage /> },
//         { path: "users", element: <UsersPage /> },
//         { path: "creators", element: <CreatorsPage /> },
//         { path: "images", element: <ImagesPage /> },
//         { path: "blogs", element: <AdminBlogs /> },
//         // { path: 'blog-categories', element: <BlogCategories /> },
//         { path: "analytics", element: <AnalyticsPage /> },
//         { path: "collections", element: <AdminCollectionsPageWrapper /> },

//       ],
//     },
//     {
//       path: "/",
//       element: <HomePage />,
//     },
//     {
//       path: "/dashboard",
//       element: (
//         <ProtectedCreatorRoute>
//           <Dashboard />
//         </ProtectedCreatorRoute>
//       ),
//     },
//     {
//       path: "/pricing",
//       element: <PricingPlan />,
//     },
//     {
//       path: "/contactus",
//       element: <Contactus />,
//     },
//     {
//       path: "/login",
//       element: <Login />,
//     },
//     {
//       path: "/signup",
//       element: <Signup />,
//     },
//     {
//       path: "/collection/:name",
//       element: <Sidebar />,
//     },
//     {
//       path: "/member",
//       element: <Member />,
//     },
//     {
//       path: "/memberdetail/:id",
//       element: <MemberDetail />,
//     },
//     {
//       path: "/upload",
//       element: (
//         <ProtectedCreatorRoute>
//           <Upload />
//         </ProtectedCreatorRoute>
//       ),
//     },
//     {
//       path: "/collections",
//       element: <Collections />,
//     },
//     {
//       path: "/collections/:id",
//       element: <CollectionDetail />,
//     },
//     {
//       path: "/files/under-revision",
//       element: (
//         <ProtectedCreatorRoute>
//           <UnderRevision />
//         </ProtectedCreatorRoute>
//       ),
//     },
//     {
//       path: "/files/rejections",
//       element: (
//         <ProtectedCreatorRoute>
//           <Rejections />
//         </ProtectedCreatorRoute>
//       ),
//     },
//     {
//       path: "/files/published",
//       element: (
//         <ProtectedCreatorRoute>
//           <Published />
//         </ProtectedCreatorRoute>
//       ),
//     },
//     {
//       path: "/profile",
//       element: (
//         <ProtectedRoute>
//           <Profile />
//         </ProtectedRoute>
//       ),
//     },
//     {
//       path: "/profile/contributor",
//       element: (
//         <ProtectedRoute>
//           <Profile />
//         </ProtectedRoute>
//       ),
//     },
//     {
//       path: "/termsandcondition",
//       element: <TermsAndConditions />,
//     },
//     {
//       path: "/videocollection/:name",
//       element: <VideoPage />,
//     },
//     {
//       path: "/blog/",

//       element: <WordpressBlogRedirect />,
//     },

//     {
//       path: "/blog",
//       element: <NotFound />,
//     },
//     // {
//     //     path: "/blog/:slug",
//     //     element: <BlogDetail />
//     // },
//     // {
//     //     path: "/blog/category/:slug",
//     //     element: <CategoryDetail />
//     // },
//     {
//       path: "/blogs1",
//       element: <BlogsPage1 />,
//     },
//     {
//       path: "/blogs2",
//       element: <BlogsPage2 />,
//     },
//     {
//       path: "/blogs3",
//       element: <BlogsPage3 />,
//     },
//     {
//       path: "/blogs4",
//       element: <BlogsPage4 />,
//     },
//     {
//       path: "/setting",
//       element: (
//         <ProtectedRoute>
//           <Setting />
//         </ProtectedRoute>
//       ),
//     },
//     {
//       path: "/search/:category/:name",
//       element: <Search />,
//     },
//     {
//       path: "/search/:term",
//       element: <Search />,
//     },
//     {
//       path: "/asset/:categorySlug/:subSlug?/:subSubSlug?/:id",
//       element: <AssetDetail />,
//     },
//     {
//       path: "/asset/:id",
//       element: <AssetDetail />,
//     },
//     {
//       path: "/ai/:id",
//       element: <AiToolPage />,
//     },
//   ]);

//   return <RouterProvider router={router} />;
// }

// export default Routing;


import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Cookies from "js-cookie";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import AdminLogin from "../Admin/pages/Login";
import AdminDashboard from "../Admin/pages/Dashboard";
import CategoriesPage from "../Admin/pages/Categories";
import UsersPage from "../Admin/pages/Users";
import CreatorsPage from "../Admin/pages/Creators";
import ImagesPage from "../Admin/pages/Images";
import AnalyticsPage from "../Admin/pages/Analytics";
import AdminSidebar from "../Admin/components/Sidebar";
import AdminTopbar from "../Admin/components/Topbar";
import NotFound from "../Pages/NotFound"; // Adjust the path if needed
// import CategoryDetail from '../Pages/CategoryDetail';
import WordpressBlogRedirect from "../Pages/WordpressBlogRedirect";
import AiToolPage from "../Pages/AiToolPage"; // NEW
// Admin Protected Route
function AdminProtectedRoute({ children }) {
  const isAdmin = !!Cookies.get("token");
  return isAdmin ? children : <Navigate to="/admin/login" />;
}

// Admin Layout
function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1 }}>
        <AdminTopbar />
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
import HomePage from "../Pages/HomePage";
import Dashboard from "../Pages/Dashboard";
import PricingPlan from "../Pages/PricingPlan";
import Login from "../Pages/Login";
import Signup from "../Pages/Signup";
import Member from "../Pages/Member";
import Contactus from "../Pages/Contactus";
import Sidebar from "../Components/Sidebar/Sidebar";
import MemberDetail from "../Pages/MemberDetail";
import Upload from "../Pages/Upload";
import Profile from "../Pages/Profile";
import Collections from "../Pages/Collections";
import CollectionDetail from "../Pages/CollectionDetail";
import UnderRevision from "../Pages/UnderRevision";
import Rejections from "../Pages/Rejections";
import Published from "../Pages/Published";
import TermsAndConditions from "../Pages/TermsAndConditions";
import VideoPage from "../Pages/VideoPage";
// import BlogsList from '../Pages/BlogsList';
import AdminBlogs from "../Admin/pages/Blogs";
// import BlogCategories from '../Admin/pages/BlogCategories';
import BlogsPage1 from "../Pages/BlogsPage1";
import BlogsPage2 from "../Pages/BlogsPage2";
import BlogsPage3 from "../Pages/BlogsPage3";
import BlogsPage4 from "../Pages/BlogsPage4";
import AdminCollectionsPageWrapper from "../Admin/Pages/AdminCollectionsPage";
// import BlogDetail from '../Pages/BlogDetail';
import Setting from "../Pages/Setting";
import Search from "../Pages/SearchPage";
import AssetDetail from "../Pages/AssetDetail";
import { useGlobalState } from "../Context/Context";

import  AboutUs  from '../Pages/Company/AboutUs';
import  ContactUs  from '../Pages/Company/ContactUs';
import  Faq  from '../Pages/Company/Faq';
import  Terms from '../Pages/Company/Terms';
import  Privacy  from '../Pages/Company/Privacy';

function ProtectedRoute({ children }) {
  const token = Cookies.get("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function ProtectedCreatorRoute({ children }) {
  const token = Cookies.get("token");
  const location = useLocation();
  const { userData, creatorData } = useGlobalState();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const creatorUserId = creatorData?.userId?._id || creatorData?.userId;
  const userCreatorId = userData?.creatorId?._id || userData?.creatorId;

  const belongsToUser =
    creatorData &&
    userData &&
    ((creatorUserId &&
      userData._id &&
      `${creatorUserId}` === `${userData._id}`) ||
      (userCreatorId &&
        creatorData._id &&
        `${userCreatorId}` === `${creatorData._id}`));

  const isLoading = creatorData === undefined || !userData?._id;
  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <CircularProgress />
      </div>
    );
  }

  const isApprovedCreator = creatorData?.status === "approved" && belongsToUser;
  if (!isApprovedCreator) {
    return (
      <Navigate
        to="/profile"
        replace
        state={{ from: location.pathname, reason: "creator-required" }}
      />
    );
  }

  return children;
}

function Routing() {
  const router = createBrowserRouter([
    // Admin routes
    {
      path: "/admin/login",
      element: <AdminLogin />,
    },
    {
      path: "/admin",
      element: (
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      ),
      children: [
        { path: "", element: <AdminDashboard /> },
        { path: "categories", element: <CategoriesPage /> },
        { path: "users", element: <UsersPage /> },
        { path: "creators", element: <CreatorsPage /> },
        { path: "images", element: <ImagesPage /> },
        { path: "blogs", element: <AdminBlogs /> },
        // { path: 'blog-categories', element: <BlogCategories /> },
        { path: "analytics", element: <AnalyticsPage /> },
        { path: "collections", element: <AdminCollectionsPageWrapper /> },

      ],
    },
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedCreatorRoute>
          <Dashboard />
        </ProtectedCreatorRoute>
      ),
    },
    {
      path: "/pricing",
      element: <PricingPlan />,
    },
    {
      path: "/contactus",
      element: <Contactus />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/collection/:name",
      element: <Sidebar />,
    },
    {
      path: "/member",
      element: <Member />,
    },
    {
      path: "/memberdetail/:id",
      element: <MemberDetail />,
    },
    {
      path: "/upload",
      element: (
        <ProtectedCreatorRoute>
          <Upload />
        </ProtectedCreatorRoute>
      ),
    },
    {
      path: "/collections",
      element: <Collections />,
    },
    {
      path: "/collections/:id",
      element: <CollectionDetail />,
    },
    {
      path: "/files/under-revision",
      element: (
        <ProtectedCreatorRoute>
          <UnderRevision />
        </ProtectedCreatorRoute>
      ),
    },
    {
      path: "/files/rejections",
      element: (
        <ProtectedCreatorRoute>
          <Rejections />
        </ProtectedCreatorRoute>
      ),
    },
    {
      path: "/files/published",
      element: (
        <ProtectedCreatorRoute>
          <Published />
        </ProtectedCreatorRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile/contributor",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },
    {
      path: "/termsandcondition",
      element: <TermsAndConditions />,
    },
    {
      path: "/videocollection/:name",
      element: <VideoPage />,
    },
    {
      path: "/blog/",

      element: <WordpressBlogRedirect />,
    },

    {
      path: "/blog",
      element: <NotFound />,
    },
    // {
    //     path: "/blog/:slug",
    //     element: <BlogDetail />
    // },
    // {
    //     path: "/blog/category/:slug",
    //     element: <CategoryDetail />
    // },
    {
      path: "/blogs1",
      element: <BlogsPage1 />,
    },
    {
      path: "/blogs2",
      element: <BlogsPage2 />,
    },
    {
      path: "/blogs3",
      element: <BlogsPage3 />,
    },
    {
      path: "/blogs4",
      element: <BlogsPage4 />,
    },
    {
      path: "/setting",
      element: (
        <ProtectedRoute>
          <Setting />
        </ProtectedRoute>
      ),
    },
    {
      path: "/search/:category/:name",
      element: <Search />,
    },
    {
      path: "/search/:term",
      element: <Search />,
    },
    {
      path: "/asset/:categorySlug/:subSlug?/:subSubSlug?/:id",
      element: <AssetDetail />,
    },
    {
      path: "/asset/:id",
      element: <AssetDetail />,
    },

    // Company pages
    {
      path: "/company",
      element: <Navigate to="/company/about-us" replace />,
    },
    {
      path: "/company/about-us",
      element: <AboutUs />,
    },
    {
      path: "/company/contact-us",
      element: <ContactUs />,
    },
    {
      path: "/company/faq",
      element: <Faq />,
    },
    {
      path: "/company/terms",
      element: <Terms />,
    },
    {
      path: "/company/privacy",
      element: <Privacy />,
    },

    {
      path: "/ai/:id",
      element: <AiToolPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default Routing;
