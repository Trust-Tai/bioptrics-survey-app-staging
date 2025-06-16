import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaLayerGroup, FaPencilAlt, FaPlus, FaSpinner, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { Layers, LayerField } from '../../../api/layers';

// Define local Layer interface that extends the imported one
interface LayerDisplay {
  _id?: string;
  name: string;
  location: 'surveys' | 'questions';
  priority: number;
  fields: LayerField[];
  createdAt: Date;
}

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.primary ? 'linear-gradient(135deg, #552a47 0%, #7a4e7a 100%)' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background: ${props => props.primary ? 'linear-gradient(135deg, #4a2540 0%, #6a4269 100%)' : '#eaeaea'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: 600;
    color: #555;
    background: #f9f9f9;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover td {
    background: rgba(122, 78, 122, 0.05);
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #7a4e7a;
  transition: all 0.2s;
  
  &:hover {
    color: #552a47;
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #777;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px dashed #ddd;
  
  h3 {
    margin-bottom: 1rem;
    color: #555;
    font-weight: 500;
  }
  
  p {
    margin-bottom: 1.5rem;
    max-width: 400px;
    line-height: 1.5;
  }
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #aaa;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #7a4e7a;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusMessage = styled.div<{ success?: boolean; error?: boolean }>`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.success ? '#e7f7ed' : props.error ? '#ffebee' : '#f5f5f5'};
  color: ${props => props.success ? '#2e7d32' : props.error ? '#c62828' : '#555'};
  border-left: 4px solid ${props => props.success ? '#2e7d32' : props.error ? '#c62828' : '#ddd'};
`;

// AllLayers Component
const AllLayers: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<{ loading: boolean; message: string; type: 'success' | 'error' | 'info' }>({ 
    loading: false, 
    message: '', 
    type: 'info' 
  });
  
  // Subscribe to layers collection
  const { layers, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    const isReady = subscription.ready();
    const layers = Layers.find({}, { sort: { createdAt: -1 } }).fetch();
    
    console.log('Subscription ready:', isReady);
    console.log('Layers found:', layers.length);
    
    return {
      layers,
      isLoading: !isReady
    };
  }, []);
  
  // Force the component to show the empty state after a timeout
  // This ensures that even if the subscription is stuck, we'll show something
  const [forceShowContent, setForceShowContent] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShowContent(true);
    }, 3000); // Wait 3 seconds before forcing content display
    
    // Check for success message in localStorage
    const successMessage = localStorage.getItem('layerActionSuccess');
    if (successMessage) {
      setStatus({
        loading: false,
        message: successMessage,
        type: 'success'
      });
      
      // Clear the message from localStorage
      localStorage.removeItem('layerActionSuccess');
      
      // Auto-hide the success message after 5 seconds
      setTimeout(() => {
        setStatus({
          loading: false,
          message: '',
          type: 'info'
        });
      }, 5000);
    }
    
    // Check for error message in localStorage
    const errorMessage = localStorage.getItem('layerActionError');
    if (errorMessage) {
      setStatus({
        loading: false,
        message: errorMessage,
        type: 'error'
      });
      
      // Clear the message from localStorage
      localStorage.removeItem('layerActionError');
      
      // Auto-hide the error message after 8 seconds
      setTimeout(() => {
        setStatus({
          loading: false,
          message: '',
          type: 'info'
        });
      }, 8000);
    }
    
    return () => clearTimeout(timer);
  }, []);

  // Delete a tag
  const deleteTag = (layerId: string, layerName: string) => {
    if (window.confirm(`Are you sure you want to delete the tag "${layerName}"?`)) {
      setStatus({ loading: true, message: 'Deleting tag...', type: 'info' });
      
      Meteor.call('layers.remove', layerId, (error: Error | null, result: string) => {
        if (error) {
          console.error('Error deleting tag:', error);
          setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
        } else {
          console.log('Tag deleted successfully:', result);
          setStatus({ loading: false, message: `Tag "${layerName}" deleted successfully!`, type: 'success' });
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setStatus({ loading: false, message: '', type: 'info' });
          }, 3000);
        }
      });
    }
  };

  // Edit a tag
  const editTag = (layerId: string) => {
    navigate(`/admin/settings/layers?edit=${layerId}`);
  };

  // Toggle tag active status
  const toggleTagStatus = (layerId: string, newActiveStatus: boolean) => {
    setStatus({ loading: true, message: `${newActiveStatus ? 'Activating' : 'Deactivating'} tag...`, type: 'info' });
    
    Meteor.call('layers.updateStatus', layerId, newActiveStatus, (error: Error | null) => {
      if (error) {
        console.error('Error updating tag status:', error);
        setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
      } else {
        console.log(`Tag status updated to ${newActiveStatus ? 'active' : 'inactive'}`);
        setStatus({ 
          loading: false, 
          message: `Tag ${newActiveStatus ? 'activated' : 'deactivated'} successfully!`, 
          type: 'success' 
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus({ loading: false, message: '', type: 'info' });
        }, 3000);
      }
    });
  };

  // Create a new tag
  const createNewTag = () => {
    navigate('/admin/settings/layers');
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>All Tag Builder</Title>
          <ButtonGroup>
            <Button primary onClick={createNewTag}>
              <FaPlus /> Create New Tag
            </Button>
          </ButtonGroup>
        </Header>

        {status.message && (
          <StatusMessage success={status.type === 'success'} error={status.type === 'error'}>
            {status.message}
          </StatusMessage>
        )}

        {isLoading && !forceShowContent ? (
          <LoadingSpinner>
            <FaSpinner size={24} />
            <span style={{ marginLeft: '0.5rem' }}>Loading tags...</span>
          </LoadingSpinner>
        ) : layers.length === 0 ? (
          <EmptyState>
            <FaLayerGroup size={48} />
            <h3>No Tags Available</h3>
            <p>You haven't created any tags yet. Tags help you organize fields and customize your surveys and questions.</p>
            <Button primary onClick={createNewTag}>
              Create Your First Tag
            </Button>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Tag Name</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Fields</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {layers.map(layer => (
                <tr key={layer._id}>
                  <td>{layer.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{layer.location}</td>
                  <td>{layer.priority}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div 
                        onClick={() => toggleTagStatus(layer._id || '', !layer.active)}
                        style={{ 
                          cursor: 'pointer',
                          color: layer.active ? '#4CAF50' : '#ccc'
                        }}
                      >
                        {layer.active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                      </div>
                      <span>{layer.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td>{layer.createdAt.toLocaleDateString()}</td>
                  <td>{layer.fields.length} fields</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ActionButton
                        title="Edit Tag"
                        onClick={() => editTag(layer._id || '')}
                        disabled={status.loading}
                      >
                        <FaPencilAlt />
                      </ActionButton>
                      <ActionButton
                        title="Delete Tag"
                        onClick={() => deleteTag(layer._id || '', layer.name || 'Unnamed Tag')}
                        disabled={status.loading}
                      >
                        {status.loading ? <FaSpinner /> : <FaTrash color="#e74c3c" />}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </AdminLayout>
  );
};

export default AllLayers;
