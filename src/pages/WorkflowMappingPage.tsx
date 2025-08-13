import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import { Plus, Trash2, Link, Search, Filter } from 'lucide-react';

// Define the type for Functionality, mirroring the backend POJO
interface Functionality {
  id: number;
  name: string;
  type: string;
}

const WorkflowMappingPage: React.FC = () => {
  const { workflows, isLoading, error, fetchWorkflows } = useWorkflowStore();
  const [mappings, setMappings] = useState<any[]>([]);
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]); // New state for functionalities
  const [isFunctionalitiesLoading, setIsFunctionalitiesLoading] = useState(false); // New loading state

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    workflowId: '',
    functionalityId: '',
    functionalityName: '',
    functionalityType: '',
  });

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';

  // Function to fetch functionalities from the backend
  const fetchFunctionalities = async () => {
    setIsFunctionalitiesLoading(true);
    try {
      const response = await fetch(`${baseUrl}/functionalities`);
      if (response.ok) {
        const functionalitiesData = await response.json();
        setFunctionalities(Array.isArray(functionalitiesData) ? functionalitiesData : []);
      }
    } catch (error) {
      console.error('Failed to fetch functionalities:', error);
    } finally {
      setIsFunctionalitiesLoading(false);
    }
  };

  // Function to fetch workflow mappings from the backend
  const fetchMappings = async () => {
    try {
      const response = await fetch(`${baseUrl}/workflow-mappings`);
      if (response.ok) {
        const mappingsData = await response.json();
        setMappings(Array.isArray(mappingsData) ? mappingsData : []);
      }
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchFunctionalities(); // Fetch functionalities on component mount
    fetchMappings();
  }, [fetchWorkflows]);

  const createMapping = async (mapping: any) => {
    try {
      await fetch(`${baseUrl}/workflow-mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapping),
      });

      // Refresh mappings
      await fetchMappings();
    } catch (error) {
      console.error('Failed to create mapping:', error);
      throw error;
    }
  };

  const deleteMapping = async (id: string) => {
    try {
      await fetch(`${baseUrl}/workflow-mappings/${id}`, {
        method: 'DELETE',
      });

      // Refresh mappings
      await fetchMappings();
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.workflowId || !formData.functionalityId) {
      // Replaced alert() with a custom message box or similar in a real app
      // For this example, we use alert() as a simple placeholder
      alert('Please select both workflow and functionality');
      return;
    }
    console.log("form fata === "+JSON.stringify(formData));
    console.log("form fata === "+JSON.stringify(functionalities));
    try {
      // Find the functionality from the fetched list
      const functionality = functionalities.find(f => f.id === parseInt(formData.functionalityId, 10));
      if (!functionality) {
        alert('Selected functionality not found.');
        return;
      }

      await createMapping({
        workflowId: formData.workflowId,
        functionalityId: formData.functionalityId,
        functionalityName: functionality.name,
        functionalityType: functionality.type,
      });

      setFormData({
        workflowId: '',
        functionalityId: '',
        functionalityName: '',
        functionalityType: '',
      });
      setShowAddForm(false);
      // Replaced alert() with a custom message box or similar in a real app
      alert('Mapping created successfully!');
    } catch (error) {
      console.error('Failed to create mapping:', error);
      alert('Failed to create mapping. Please try again.');
    }
  };

  const handleDelete = async (mappingId: string) => {
    // Replaced confirm() with a custom modal in a real app
    if (confirm('Are you sure you want to delete this mapping?')) {
      try {
        await deleteMapping(mappingId);
        // Replaced alert() with a custom message box or similar in a real app
        alert('Mapping deleted successfully!');
      } catch (error) {
        console.error('Failed to delete mapping:', error);
        alert('Failed to delete mapping. Please try again.');
      }
    }
  };

  const workflowOptions = workflows.map(workflow => ({
    value: workflow.id,
    label: `${workflow.name} (v${workflow.version})`,
  }));

  // Use the fetched functionalities for the dropdown
  const functionalityOptions = functionalities.map(func => ({
    value: func.id,
    label: `${func.name} (${func.type})`,
  }));

  // Filter mappings
  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = mapping.functionalityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mapping.functionalityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || mapping.functionalityType === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading || isFunctionalitiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => {
          fetchMappings();
          fetchFunctionalities();
        }}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Workflow Mapping
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Map workflows to functionalities for automated execution
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Mapping
        </Button>
      </div>

      {/* Create Mapping Form */}
      {showAddForm && (
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-white mb-4">
            Create New Mapping
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropdown
                label="Select Workflow"
                value={formData.workflowId}
                onChange={(value) => setFormData(prev => ({ ...prev, workflowId: value }))}
                options={workflowOptions}
                placeholder="Choose a workflow"
                required
              />
              <Dropdown
                label="Select Functionality"
                value={formData.functionalityId}
                onChange={(value) => {
                  const functionality = functionalities.find(f => f.id === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    functionalityId: value,
                    functionalityName: functionality?.name || '',
                    functionalityType: functionality?.type || '',
                  }));
                }}
                options={functionalityOptions}
                placeholder="Choose a functionality"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                variant="primary"
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Create Mapping
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    workflowId: '',
                    functionalityId: '',
                    functionalityName: '',
                    functionalityType: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="p-4 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search mappings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="feature">Features</option>
                <option value="alert">Alerts</option>
                <option value="task">Tasks</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Mappings List */}
      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
        <div className="flex items-center space-x-3 mb-6">
          <Link className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold text-primary-700 dark:text-white">
            Workflow-Functionality Mappings
          </h2>
        </div>

        {filteredMappings.length === 0 ? (
          <div className="text-center py-12">
            <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No mappings found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first workflow mapping to automate functionality execution
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Mapping
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Functionality
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Assigned Workflow
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((mapping) => {
                  const workflow = workflows.find(w => w.id === mapping.workflowId);
                  return (
                    <tr
                      key={mapping.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        {mapping.functionalityName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (mapping.functionalityType || '') === 'feature' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : (mapping.functionalityType || '') === 'alert'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {(mapping.functionalityType || '').charAt(0).toUpperCase() + (mapping.functionalityType || '').slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {workflow ? `${workflow.name} (v${workflow.version})` : 'Unknown Workflow'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(mapping.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(mapping.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkflowMappingPage;
