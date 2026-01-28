import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import Cookies from 'js-cookie';
import { createBrowserRouter, RouterProvider, Navigate, useLocation, Outlet } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import AdminLogin from '../Admin/pages/Login';
import AdminDashboard from '../Admin/pages/Dashboard';
import CategoriesPage from '../Admin/pages/Categories';
import UsersPage from '../Admin/pages/Users';
import CreatorsPage from '../Admin/pages/Creators';
import ImagesPage from '../Admin/pages/Images';
import AnalyticsPage from '../Admin/pages/Analytics';
import AdminSidebar from '../Admin/components/Sidebar';
import AdminTopbar from '../Admin/components/Topbar';
import CategoryDetail from '../Pages/CategoryDetail';
// Admin Protected Route
function AdminProtectedRoute({ children }) {
    const isAdmin = !!Cookies.get('token');
    return isAdmin ? children : <Navigate to="/admin/login" />;
}

// Admin Layout
function AdminLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
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
import HomePage from '../Pages/HomePage'; 
import Dashboard from '../Pages/Dashboard';
import PricingPlan from '../Pages/PricingPlan';
import Login from '../Pages/Login';
import Signup from '../Pages/Signup';
import Member from '../Pages/Member';
import Contactus from '../Pages/Contactus';
import Sidebar from '../Components/Sidebar/Sidebar';
import MemberDetail from '../Pages/MemberDetail';
import Upload from '../Pages/Upload';
import Profile from '../Pages/Profile';
import Collections from '../Pages/Collections';
import CollectionDetail from '../Pages/CollectionDetail';
import UnderRevision from '../Pages/UnderRevision';
import Rejections from '../Pages/Rejections';
import Published from '../Pages/Published';
import TermsAndConditions from '../Pages/TermsAndConditions';
import VideoPage from '../Pages/VideoPage';
import BlogsList from '../Pages/BlogsList';
import AdminBlogs from '../Admin/pages/Blogs';
import BlogCategories from '../Admin/pages/BlogCategories';
import BlogsPage1 from '../Pages/BlogsPage1';
import BlogsPage2 from '../Pages/BlogsPage2';
import BlogsPage3 from '../Pages/BlogsPage3';
import BlogsPage4 from '../Pages/BlogsPage4';
import BlogDetail from '../Pages/BlogDetail';
import Setting from '../Pages/Setting';
import Search from '../Pages/SearchPage';
import AssetDetail from '../Pages/AssetDetail';
import { useGlobalState } from '../Context/Context';

function ProtectedRoute({ children }) {
    const token = Cookies.get('token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}

function ProtectedCreatorRoute({ children }) {
    const token = Cookies.get('token');
    const location = useLocation();
    const { userData, creatorData } = useGlobalState();

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    const creatorUserId = creatorData?.userId?._id || creatorData?.userId;
    const userCreatorId = userData?.creatorId?._id || userData?.creatorId;

    const belongsToUser = creatorData && userData && (
        (creatorUserId && userData._id && `${creatorUserId}` === `${userData._id}`) ||
        (userCreatorId && creatorData._id && `${userCreatorId}` === `${creatorData._id}`)
    );

    const isLoading = creatorData === undefined || !userData?._id;
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    const isApprovedCreator = creatorData?.status === 'approved' && belongsToUser;
    if (!isApprovedCreator) {
        return <Navigate to="/profile" replace state={{ from: location.pathname, reason: 'creator-required' }} />;
    }

    return children;
}

function Routing() {
    const router = createBrowserRouter([
        // Admin routes
        {
            path: '/admin/login',
            element: <AdminLogin />,
        },
        {
            path: '/admin',
            element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
            children: [
                { path: '', element: <AdminDashboard /> },
                { path: 'categories', element: <CategoriesPage /> },
                { path: 'users', element: <UsersPage /> },
                { path: 'creators', element: <CreatorsPage /> },
                { path: 'images', element: <ImagesPage /> },
                { path: 'blogs', element: <AdminBlogs /> },
                { path: 'blog-categories', element: <BlogCategories /> },
                { path: 'analytics', element: <AnalyticsPage /> },
                
            ],
        },
        {
            path: "/",
            element: <HomePage />
        },
        {
            path: "/dashboard",
            element: (
                <ProtectedCreatorRoute>
                    <Dashboard />
                </ProtectedCreatorRoute>
            )
        },
        {
            path: "/pricing",
            element: <PricingPlan />
        },
        {
            path: "/contactus",
            element: <Contactus />
        },
        {
            path: "/login",
            element: <Login />
        },
        {
            path: "/signup",
            element: <Signup />
        },
        {
            path: "/collection/:name",
            element: <Sidebar />
        },
        {
            path: "/member",
            element: <Member />
        },
        {
            path: "/memberdetail/:id",
            element: <MemberDetail />
        },
        {
            path: "/upload",
            element: (
                <ProtectedCreatorRoute>
                    <Upload />
                </ProtectedCreatorRoute>
            )
        },
        {
            path: "/collections",
            element: <Collections />
        },
        {
            path: "/collections/:id",
            element: <CollectionDetail />
        },
        {
            path: "/files/under-revision",
            element: (
                <ProtectedCreatorRoute>
                    <UnderRevision />
                </ProtectedCreatorRoute>
            )
        },
        {
            path: "/files/rejections",
            element: (
                <ProtectedCreatorRoute>
                    <Rejections />
                </ProtectedCreatorRoute>
            )
        },
        {
            path: "/files/published",
            element: (
                <ProtectedCreatorRoute>
                    <Published />
                </ProtectedCreatorRoute>
            )
        },
        {
            path: "/profile",
            element: (
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            )
        },
        {
            path: "/profile/contributor",
            element: (
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            )
        },
        {
            path: "/termsandcondition",
            element: <TermsAndConditions />
        },
        {
            path: "/videocollection/:name",
            element: <VideoPage />
        },
        { 
            path: "/blog",
            element: <BlogsList />
        },
        {
            path: "/blog/:slug",
            element: <BlogDetail />
        },
        {
            path: "/blog/category/:slug",
            element: <CategoryDetail />
        },
        {
            path: "/blogs1",
            element: <BlogsPage1 />
        },
        {
            path: "/blogs2",
            element: <BlogsPage2 />
        },
        {
            path: "/blogs3",
            element: <BlogsPage3 />
        },
        {
            path: "/blogs4",
            element: <BlogsPage4 />
        },
        {
            path: "/setting",
            element: (
                <ProtectedRoute>
                    <Setting />
                </ProtectedRoute>
            )
        },
        {
            path: "/search/:category/:name",
            element: <Search />
        },
        {
            path: "/asset/:id",
            element: <AssetDetail />
        },
        {
            path: "/detial/:name/:id/:userId",
            element: <AssetDetail />
        }
    ]);

    return <RouterProvider router={router} />;
}

export default Routing;