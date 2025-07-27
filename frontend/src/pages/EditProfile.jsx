import { useState, useEffect } from 'react';
import { fetchCurrentUser, updateProfile } from '../services/api';
import DashBoard from '../components/DashBoard';

function EditProfile() {
  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    collegeName: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const user = await fetchCurrentUser();
      setForm({
        fullName: user.fullName || '',
        bio: user.bio || '',
        collegeName: user.collegeName || '',
      });
      setPreview(user.avatar || '');
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('fullName', form.fullName);
    data.append('bio', form.bio);
    data.append('collegeName', form.collegeName);
    if (avatar) data.append('avatar', avatar);

    try {
      await updateProfile(data);
      alert('Profile updated!');
    } catch (err) {
      console.error(err);
      alert('Update failed!');
    }
  };

  return (
    <div className='min-h-screen p-4 bg-black text-white'>

    <div className='h-16'>
        <DashBoard/>
    </div>    

      <h1 className='text-3xl text-center mb-6'>Edit Your Profile</h1>

      <form onSubmit={handleSubmit} className='max-w-xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-lg space-y-4'>
        
        <div className='text-center'>
          <img
            src={preview}
            alt="Avatar Preview"
            className='w-24 h-24 rounded-full object-cover mx-auto mb-2 border border-gray-700'
          />
          <input
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            className='w-full text-gray-300'
          />
        </div>

        <div>
          <label className='block mb-1'>Full Name</label>
          <input
            type='text'
            name='fullName'
            value={form.fullName}
            onChange={handleChange}
            className='w-full p-2 rounded bg-gray-800 text-white'
          />
        </div>

        <div>
          <label className='block mb-1'>College Name</label>
          <input
            type='text'
            name='collegeName'
            value={form.collegeName}
            onChange={handleChange}
            className='w-full p-2 rounded bg-gray-800 text-white'
          />
        </div>

        <div>
          <label className='block mb-1'>Bio</label>
          <textarea
            name='bio'
            rows='4'
            value={form.bio}
            onChange={handleChange}
            className='w-full p-2 rounded bg-gray-800 text-white'
          />
        </div>

        <button
          type='submit'
          className='w-full py-2 bg-purple-700 hover:bg-purple-800 rounded text-white font-semibold'
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
