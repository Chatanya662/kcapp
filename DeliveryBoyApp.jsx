import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  User,
  Calendar,
  Truck
} from 'lucide-react';
import apiService from '../lib/api';

const DeliveryBoyApp = ({ user }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll use mock data since the API endpoint might not exist
      const mockDeliveries = [
        {
          id: '1',
          customer: {
            name: 'John Smith',
            address: '123 Main St, City',
            mobile: '9876543210'
          },
          quantity: 2,
          status: 'Pending',
          delivery_date: new Date().toISOString().split('T')[0],
          notes: ''
        },
        {
          id: '2',
          customer: {
            name: 'Sarah Johnson',
            address: '456 Oak Avenue, Downtown',
            mobile: '9123456789'
          },
          quantity: 1,
          status: 'Pending',
          delivery_date: new Date().toISOString().split('T')[0],
          notes: ''
        }
      ];
      setDeliveries(mockDeliveries);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
      setError('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      setUpdating(deliveryId);
      
      // Update local state immediately for better UX
      setDeliveries(prev => prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status: newStatus, timestamp: new Date().toISOString() }
          : delivery
      ));

      // In a real app, this would call the API
      // await apiService.updateDeliveryStatus(deliveryId, newStatus);
      
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      setError('Failed to update delivery status');
      // Revert the optimistic update
      loadDeliveries();
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Delivered': { variant: 'default', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      'Pending': { variant: 'secondary', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
      'Issue': { variant: 'destructive', icon: AlertTriangle, color: 'bg-red-100 text-red-800' }
    };
    
    const config = variants[status] || { variant: 'outline', icon: Package, color: 'bg-gray-100 text-gray-800' };
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getStats = () => {
    const total = deliveries.length;
    const delivered = deliveries.filter(d => d.status === 'Delivered').length;
    const pending = deliveries.filter(d => d.status === 'Pending').length;
    
    return { total, delivered, pending };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">Welcome, {user.name}</h1>
              <p className="text-blue-100 text-sm">Delivery Boy</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Today</p>
            <p className="font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-xs text-gray-600">Delivered</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Deliveries List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Deliveries
          </h2>
          
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <Card key={delivery.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{delivery.customer.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {delivery.customer.address}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(delivery.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{delivery.quantity}L</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{delivery.customer.mobile}</span>
                    </div>
                  </div>

                  {delivery.status === 'Pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateDeliveryStatus(delivery.id, 'Delivered')}
                        disabled={updating === delivery.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updating === delivery.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Delivered
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateDeliveryStatus(delivery.id, 'Issue')}
                        disabled={updating === delivery.id}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Issue
                      </Button>
                    </div>
                  )}

                  {delivery.status === 'Delivered' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Delivery completed successfully
                      </p>
                    </div>
                  )}

                  {delivery.status === 'Issue' && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-800 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Issue reported - contact admin
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Deliveries Today</h3>
                <p className="text-gray-600">You have no deliveries assigned for today.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyApp;

