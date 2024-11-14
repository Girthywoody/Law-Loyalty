import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
import { 
  Card, 
  CardHeader, 
  CardContent 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabList, TabPanel, TabPanels, Tabs, TabTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  User, 
  Clock, 
  Building2, 
  UserPlus, 
  Settings, 
  LogOut 
} from 'lucide-react';

// Initialize Firebase (replace with your config)
const firebaseConfig = {
  apiKey: "AIzaSyCC9Bzela9Mhs2raQ0cQCSWJdm-GjnJvGg",
  authDomain: "law-loyalty.firebaseapp.com",
  projectId: "law-loyalty",
  storageBucket: "law-loyalty.firebasestorage.app",
  messagingSenderId: "18898180139",
  appId: "1:18898180139:web:115ada8b7ab0d8a9edb26e",
  measurementId: "G-XTKBQK7L33"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Constants
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

// Restaurant data from your provided list
const RESTAURANTS = [
  { id: "montanas", name: "Montana's", discount: "20%" },
  { id: "kelseys", name: "Kelsey's", discount: "20%" },
  // ... rest of your restaurants array
];

// Authentication Context
const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUser({ ...user, ...userDoc.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">JLaw Loyalty</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const [managers, setManagers] = useState([]);
  const [newManager, setNewManager] = useState({ email: '', name: '', restaurant: '' });
  const [showAddManager, setShowAddManager] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'manager'));
    return onSnapshot(q, (snapshot) => {
      setManagers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAddManager = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        newManager.email,
        'temporaryPassword123'
      );

      await setDoc(doc(db, 'users', user.uid), {
        name: newManager.name,
        email: newManager.email,
        role: ROLES.MANAGER,
        restaurantId: newManager.restaurant,
        createdAt: new Date()
      });

      setShowAddManager(false);
      setNewManager({ email: '', name: '', restaurant: '' });
    } catch (error) {
      console.error('Error adding manager:', error);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={() => setShowAddManager(true)}>Add Manager</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell>{manager.name}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>
                    {RESTAURANTS.find(r => r.id === manager.restaurantId)?.name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => deleteDoc(doc(db, 'users', manager.id))}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddManager} onOpenChange={setShowAddManager}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Manager</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={newManager.name}
              onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={newManager.email}
              onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
            />
            <Select
              value={newManager.restaurant}
              onValueChange={(value) => setNewManager({ ...newManager, restaurant: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Restaurant" />
              </SelectTrigger>
              <SelectContent>
                {RESTAURANTS.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddManager}>Add Manager</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Manager Dashboard
const ManagerDashboard = ({ user }) => {
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);

  useEffect(() => {
    // Get active employees
    const employeesQuery = query(
      collection(db, 'users'),
      where('restaurantId', '==', user.restaurantId),
      where('role', '==', 'employee')
    );

    // Get pending registrations
    const registrationsQuery = query(
      collection(db, 'registrations'),
      where('restaurantId', '==', user.restaurantId),
      where('status', '==', 'pending')
    );

    const unsubEmployees = onSnapshot(employeesQuery, (snapshot) => {
      setActiveEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubRegistrations = onSnapshot(registrationsQuery, (snapshot) => {
      setPendingRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubEmployees();
      unsubRegistrations();
    };
  }, [user.restaurantId]);

  const handleApproveRegistration = async (registration) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        registration.email,
        'temporaryPassword123'
      );

      await setDoc(doc(db, 'users', user.uid), {
        name: registration.name,
        email: registration.email,
        role: ROLES.EMPLOYEE,
        restaurantId: registration.restaurantId,
        verified: true,
        createdAt: new Date()
      });

      await updateDoc(doc(db, 'registrations', registration.id), {
        status: 'approved'
      });
    } catch (error) {
      console.error('Error approving registration:', error);
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="employees">
        <TabList>
          <TabTrigger value="employees">Active Employees</TabTrigger>
          <TabTrigger value="pending">Pending Registrations</TabTrigger>
        </TabList>
        <TabPanels>
          <TabPanel value="employees">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Active Employees</h2>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-600">
                            Active
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            onClick={() => deleteDoc(doc(db, 'users', employee.id))}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value="pending">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Pending Registrations</h2>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>{registration.name}</TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>
                          <div className="space-x-2">
                            <Button
                              onClick={() => handleApproveRegistration(registration)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteDoc(doc(db, 'registrations', registration.id))}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

// Employee Dashboard
const EmployeeDashboard = ({ user }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const restaurant = RESTAURANTS.find(r => r.id === user.restaurantId);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">JLaw Enterprise</h1>
              <Button variant="ghost" onClick={() => signOut(auth)}>
                Sign Out
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-blue-600">
                <User className="h-full w-full p-2 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user.name}</h2>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
              <span className="ml-auto rounded bg-green-100 px-2 py-1 text-sm text-green-600">
                Verified
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-blue-600">
                {currentTime.toLocaleTimeString()}
              </h2>
              <p className="text-blue-600">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Current Benefits</h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Meal Allowance</span>
                <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-600">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Employee Discount</span>
                <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-600">
                  {restaurant?.discount || '20%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Registration Component
const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurant: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const registrationRef = doc(collection(db, 'registrations'));
      await setDoc(registrationRef, {
        ...formData,
        status: 'pending',
        createdAt: new Date()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', restaurant: '', location: '' });
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Employee Registration</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Select
              value={formData.restaurant}
              onValueChange={(value) => setFormData({ ...formData, restaurant: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Restaurant" />
              </SelectTrigger>
              <SelectContent>
                {RESTAURANTS.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.restaurant && RESTAURANTS.find(r => r.id === formData.restaurant)?.locations && (
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {RESTAURANTS.find(r => r.id === formData.restaurant)?.locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>
                  Registration submitted successfully! Please wait for approval.
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Main Layout Component
const MainLayout = () => {
  const { user } = React.useContext(AuthContext);

  const getDashboard = () => {
    switch (user.role) {
      case ROLES.ADMIN:
        return <AdminDashboard />;
      case ROLES.MANAGER:
        return <ManagerDashboard user={user} />;
      case ROLES.EMPLOYEE:
        return <EmployeeDashboard user={user} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold">JLaw Loyalty</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => signOut(auth)}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {getDashboard()}
      </main>
    </div>
  );
};

export default App;