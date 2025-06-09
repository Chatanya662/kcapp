import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Truck, 
  Phone, 
  User,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import apiService from '../lib/api';

const DeliveryBoysPage = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    mobile: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeliveryBoys();
  }, []);

  const loadDeliveryBoys = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since we don't have a specific endpoint for delivery boys
      // In a real application, you would have an endpoint like /api/users?role=delivery_boy
      const mockDeliveryBoys = [
        {
          id: '684728f29c3dc7c743e292b6',
          username: 'delivery_boy1',
          name: 'John Delivery',
          mobile: '9876543210',
          created_at: new Date().toISOString(),
          status: 'Active',
          total_deliveries: 15,
          completed_deliveries: 12
        },
        {
          id: '684728f29c3dc7c743e292b7',
          username: 'delivery_boy2',
          name: 'Mike Transport',
          mobile: '9876543211',
          created_at: new Date().toISOString(),
          status: 'Active',
          total_deliveries: 8,
          completed_deliveries: 7
        }
      ];
      setDeliveryBoys(mockDeliveryBoys);
    } catch (error) {
      console.error('Failed to load delivery boys:', error);
      setError('Failed to load delivery boys');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingDeliveryBoy) {
        // Update existing delivery boy
        const updatedBoy = {
          ...editingDeliveryBoy,
          name: formData.name,
          mobile: formData.mobile
        };
        setDeliveryBoys(prev => prev.map(boy => 
          boy.id === editingDeliveryBoy.id ? updatedBoy : boy
        ));
      } else {
        // Create new delivery boy
        const newDeliveryBoy = await apiService.register({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          role: 'delivery_boy'
        });
        
        // Add to local state with additional fields
        const deliveryBoyWithStats = {
          ...newDeliveryBoy,
          mobile: formData.mobile,
          status: 'Active',
          total_deliveries: 0,
          completed_deliveries: 0,
          created_at: new Date().toISOString()
        };
        
        setDeliveryBoys(prev => [...prev, deliveryBoyWithStats]);
      }
      
      handleCloseDialog();
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (deliveryBoy) => {
    setEditingDeliveryBoy(deliveryBoy);
    setFormData({
      username: deliveryBoy.username,
      password: '',
      name: deliveryBoy.name,
      mobile: deliveryBoy.mobile
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (deliveryBoyId) => {
    if (!confirm('Are you sure you want to delete this delivery boy?')) {
      return;
    }

    try {
      // In a real application, you would call an API to delete the delivery boy
      setDeliveryBoys(prev => prev.filter(boy => boy.id !== deliveryBoyId));
    } catch (error) {
      console.error('Failed to delete delivery boy:', error);
      setError('Failed to delete delivery boy');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDeliveryBoy(null);
    setFormData({ username: '', password: '', name: '', mobile: '' });
    setError('');
  };

  const filteredDeliveryBoys = deliveryBoys.filter(boy =>
    boy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boy.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boy.mobile.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    return status === 'Active' ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getTotalStats = () => {
    return {
      total: deliveryBoys.length,
      active: deliveryBoys.filter(boy => boy.status === 'Active').length,
      totalDeliveries: deliveryBoys.reduce((sum, boy) => sum + boy.total_deliveries, 0),
      completedDeliveries: deliveryBoys.reduce((sum, boy) => sum + boy.completed_deliveries, 0)
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Delivery Boys</h2>
          <p className="text-muted-foreground">
            Manage delivery personnel and track their performance
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Delivery Boy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDeliveryBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}
              </DialogTitle>
              <DialogDescription>
                {editingDeliveryBoy 
                  ? 'Update delivery boy information below.'
                  : 'Enter delivery boy details to add them to your team.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!editingDeliveryBoy && (
                  <>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingDeliveryBoy ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingDeliveryBoy ? 'Update Delivery Boy' : 'Add Delivery Boy'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Delivery Boys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedDeliveries}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search delivery boys by name, username, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Boys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Boys List</CardTitle>
          <CardDescription>
            All delivery personnel and their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveryBoys.length > 0 ? (
                  filteredDeliveryBoys.map((boy) => (
                    <TableRow key={boy.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>{boy.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{boy.username}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{boy.mobile}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(boy.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{boy.completed_deliveries}/{boy.total_deliveries}</p>
                          <p className="text-muted-foreground">Completed/Total</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${boy.total_deliveries > 0 ? (boy.completed_deliveries / boy.total_deliveries) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {boy.total_deliveries > 0 ? Math.round((boy.completed_deliveries / boy.total_deliveries) * 100) : 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {new Date(boy.created_at).toLocaleDateString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(boy)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(boy.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No delivery boys found matching your search.' : 'No delivery boys added yet.'}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryBoysPage;

