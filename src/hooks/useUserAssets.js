import { useEffect, useMemo, useState } from 'react';
import { getImagesByCreatorId } from '../Services/getImages';
import { useGlobalState } from '../Context/Context';

const sortByDateDesc = (items = []) => {
  return [...items].sort((a, b) => new Date(b.createdAt || b.fileMetadata?.uploadedAt || 0) - new Date(a.createdAt || a.fileMetadata?.uploadedAt || 0));
};

const useUserAssets = () => {
  const { creatorData } = useGlobalState();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchAssets = async () => {
      if (!creatorData?._id) {
        setAssets([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getImagesByCreatorId(creatorData._id);
        if (!active) return;
        setAssets(sortByDateDesc(data));
        setError('');
      } catch (err) {
        if (!active) return;
        console.error('Failed to load user assets', err?.message || err);
        setAssets([]);
        setError('Could not load your files right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAssets();
    return () => { active = false; };
  }, [creatorData?._id]);

  const published = useMemo(() => assets.filter((item) => item.approved === true && item.rejected !== true), [assets]);
  const rejected = useMemo(() => assets.filter((item) => item.rejected === true), [assets]);
  const pending = useMemo(() => assets.filter((item) => item.approved !== true && item.rejected !== true), [assets]);

  const counts = useMemo(() => ({
    published: published.length,
    rejected: rejected.length,
    pending: pending.length,
    total: assets.length,
  }), [assets.length, pending.length, published.length, rejected.length]);

  return {
    assets,
    published,
    rejected,
    pending,
    counts,
    loading,
    error,
  };
};

export default useUserAssets;
