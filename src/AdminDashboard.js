import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', price: '', category: '', image: null });
  const [imagePreview, setImagePreview] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '', image: null, imageUrl: '' });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [success, setSuccess] = useState('');
  const [gallery, setGallery] = useState([]);
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryError, setGalleryError] = useState('');
  const [galleryLoading, setGalleryLoading] = useState(false);

  const token = localStorage.getItem('adminToken');

  // Fetch menu items
  useEffect(() => {
    fetch(`${API_URL}/api/menu`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => { setError('Failed to fetch menu'); setLoading(false); });
  }, [token]);

  useEffect(() => {
    fetch(`${API_URL}/api/gallery`)
      .then(res => res.json())
      .then(data => {
        console.log('Gallery data:', data);
        setGallery(data);
      })
      .catch(err => {
        console.error('Gallery fetch error:', err);
        setGallery([]);
      });
  }, []);

  // Handle form input
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(f => ({ ...f, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Add new dish
  const handleAdd = async e => {
    e.preventDefault();
    setAdding(true);
    setError('');
    setSuccess('');
    let imageUrl = '';
    if (form.image) {
      // Upload image
      const imgData = new FormData();
      imgData.append('image', form.image);
      const imgRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: imgData
      });
      const imgJson = await imgRes.json();
      imageUrl = imgJson.imageUrl;
    }
    // Add menu item
    const res = await fetch(`${API_URL}/api/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: form.name,
        price: form.price,
        category: form.category,
        imageUrl
      })
    });
    if (res.ok) {
      const newItem = await res.json();
      setMenu(m => [...m, newItem]);
      setForm({ name: '', price: '', category: '', image: null });
      setImagePreview('');
      setSuccess('Dish added!');
    } else {
      setError('Failed to add dish');
    }
    setAdding(false);
    setTimeout(() => setSuccess(''), 2000);
  };

  // Delete dish
  const handleDelete = async id => {
    if (!window.confirm('Delete this dish?')) return;
    const res = await fetch(`${API_URL}/api/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setMenu(m => m.filter(item => item._id !== id));
      setSuccess('Dish deleted!');
    } else {
      setError('Failed to delete dish');
    }
    setTimeout(() => setSuccess(''), 2000);
  };

  // Start editing
  const handleEditStart = item => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      price: item.price,
      category: item.category,
      image: null,
      imageUrl: item.imageUrl || ''
    });
    setEditImagePreview(item.imageUrl ? API_URL + item.imageUrl : '');
  };

  // Handle edit form input
  const handleEditChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setEditForm(f => ({ ...f, image: files[0] }));
      setEditImagePreview(URL.createObjectURL(files[0]));
    } else {
      setEditForm(f => ({ ...f, [name]: value }));
    }
  };

  // Save edit
  const handleEditSave = async id => {
    setError('');
    setSuccess('');
    let imageUrl = editForm.imageUrl;
    if (editForm.image) {
      // Upload new image
      const imgData = new FormData();
      imgData.append('image', editForm.image);
      const imgRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: imgData
      });
      const imgJson = await imgRes.json();
      imageUrl = imgJson.imageUrl;
    }
    const res = await fetch(`${API_URL}/api/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editForm.name,
        price: editForm.price,
        category: editForm.category,
        imageUrl
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setMenu(m => m.map(item => item._id === id ? updated : item));
      setSuccess('Dish updated!');
      setEditingId(null);
    } else {
      setError('Failed to update dish');
    }
    setTimeout(() => setSuccess(''), 2000);
  };

  // Cancel edit
  const handleEditCancel = () => {
    setEditingId(null);
    setEditImagePreview('');
  };

  const handleDeleteImage = async id => {
    setError('');
    setSuccess('');
    const res = await fetch(`${API_URL}/api/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editForm.name,
        price: editForm.price,
        category: editForm.category,
        imageUrl: ''
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setMenu(m => m.map(item => item._id === id ? updated : item));
      setEditForm(f => ({ ...f, image: null, imageUrl: '' }));
      setEditImagePreview('');
      setSuccess('Image deleted!');
    } else {
      setError('Failed to delete image');
    }
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleGalleryFile = e => setGalleryFile(e.target.files[0]);
  const handleGalleryUpload = async e => {
    e.preventDefault();
    setGalleryError('');
    setGalleryLoading(true);
    if (!galleryFile) {
      setGalleryError('Please select an image.');
      setGalleryLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('image', galleryFile);
    try {
      const res = await fetch(`${API_URL}/api/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const img = await res.json();
        console.log('Uploaded image:', img);
        setGallery(g => [img, ...g]);
        setGalleryFile(null);
        setGalleryError('');
      } else {
        const errorData = await res.json();
        setGalleryError(`Failed to upload image: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setGalleryError('Network error while uploading image.');
    }
    setGalleryLoading(false);
  };
  const handleGalleryDelete = async id => {
    if (!window.confirm('Delete this gallery image?')) return;
    const res = await fetch(`${API_URL}/api/gallery/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setGallery(g => g.filter(img => img._id !== id));
    } else {
      setGalleryError('Failed to delete image.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
      <hr />
      {/* Menu Management Card */}
      <div className="admin-card" style={{ marginBottom: 40, padding: 24, borderRadius: 16, background: '#f7fafc', boxShadow: '0 2px 8px #0001' }}>
        <h3>Manage Menu</h3>
        <h3>Add New Dish</h3>
        <form onSubmit={handleAdd} className="admin-add-form">
          <input name="name" placeholder="Dish Name" value={form.name} onChange={handleChange} required />
          <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
          <input name="image" type="file" accept="image/*" onChange={handleChange} />
          {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
          <button type="submit" disabled={adding}>{adding ? 'Adding...' : 'Add Dish'}</button>
        </form>
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}
        <hr />
        <h3>Menu Items</h3>
        {loading ? <div>Loading...</div> : (
          <table className="admin-menu-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map(item => (
                <tr key={item._id}>
                  <td>
                    {editingId === item._id ? (
                      <>
                        {(editImagePreview || editForm.imageUrl) && (
                          <img
                            src={editImagePreview || editForm.imageUrl}
                            alt="Preview"
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, display: 'block', marginBottom: 4 }}
                          />
                        )}
                        <input name="image" type="file" accept="image/*" onChange={handleEditChange} />
                        {editForm.imageUrl && (
                          <button
                            type="button"
                            className="delete-image-btn"
                            onClick={() => handleDeleteImage(item._id)}
                          >
                            Delete Image
                          </button>
                        )}
                      </>
                    ) : (
                      item.imageUrl && <img src={API_URL + item.imageUrl} alt="dish" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                    )}
                  </td>
                  <td>
                    {editingId === item._id ? (
                      <input name="name" value={editForm.name} onChange={handleEditChange} />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td>
                    {editingId === item._id ? (
                      <input name="price" value={editForm.price} onChange={handleEditChange} />
                    ) : (
                      item.price
                    )}
                  </td>
                  <td>
                    {editingId === item._id ? (
                      <input name="category" value={editForm.category} onChange={handleEditChange} />
                    ) : (
                      item.category
                    )}
                  </td>
                  <td>
                    {editingId === item._id ? (
                      <>
                        <button onClick={() => handleEditSave(item._id)} style={{ color: 'green' }}>Save</button>
                        <button onClick={handleEditCancel} style={{ color: 'gray' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditStart(item)} style={{ color: 'blue' }}>Edit</button>
                        <button onClick={() => handleDelete(item._id)} style={{ color: 'red' }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Gallery Management Card */}
      <div className="admin-card" style={{ padding: 24, borderRadius: 16, background: '#f7fafc', boxShadow: '0 2px 8px #0001' }}>
        <h3>Manage Gallery ({gallery.length} images)</h3>
        <form onSubmit={handleGalleryUpload} style={{ marginBottom: 16 }}>
          <input type="file" accept="image/*" onChange={handleGalleryFile} />
          <button type="submit" disabled={galleryLoading}>{galleryLoading ? 'Uploading...' : 'Add to Gallery'}</button>
          {galleryError && <span style={{ color: '#e53e3e', marginLeft: 8 }}>{galleryError}</span>}
        </form>
        {gallery.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No gallery images yet. Upload your first image above.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            {gallery.map(img => (
              <div key={img._id} style={{ position: 'relative' }}>
                <img 
                  src={img.imageUrl.startsWith('http') ? img.imageUrl : API_URL + img.imageUrl} 
                  alt="Gallery" 
                  style={{ 
                    width: 120, 
                    height: 90, 
                    objectFit: 'cover', 
                    borderRadius: 8, 
                    boxShadow: '0 2px 8px #0001',
                    border: '2px solid #e2e8f0'
                  }} 
                />
                <div style={{ 
                  position: 'absolute', 
                  bottom: 4, 
                  left: 4, 
                  background: 'rgba(0,0,0,0.7)', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: 4, 
                  fontSize: 10 
                }}>
                  {new Date(img.createdAt).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => handleGalleryDelete(img._id)} 
                  style={{ 
                    position: 'absolute', 
                    top: 4, 
                    right: 4, 
                    background: '#e53e3e', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 4, 
                    padding: '2px 8px', 
                    fontSize: 12, 
                    cursor: 'pointer' 
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 