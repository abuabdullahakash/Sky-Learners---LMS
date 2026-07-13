import {
  Activity, AlarmClock, AlertCircle, AlertTriangle, AlignLeft, Anchor, 
  Archive, ArrowRight, Award, BarChart, Bell, Book, BookOpen, Bookmark, 
  Box, Brain, Briefcase, Calendar, Camera, Check, CheckCircle2, ChevronRight, 
  ClipboardList, Clock, Cloud, Code, Coffee, Compass, Copy, Cpu, Crosshair, 
  Database, Download, Edit3, Eye, File, FileText, Filter, Flag, Folder, 
  Gift, Globe, GraduationCap, Grid, HardDrive, Hash, Headphones, Heart, 
  HelpCircle, Home, Image as ImageIcon, Info, Key, Layers, Layout, Library, Lightbulb, 
  Link, List, Lock, Mail, Map, MapPin, MessageCircle, MessageSquare, 
  Mic, Monitor, Moon, MousePointer, Music, Navigation, Package, Palette, 
  Paperclip, PenTool, Phone, PieChart, Play, Plus, Power, Printer, Puzzle, 
  Radio, RefreshCw, Rocket, Save, Scissors, Search, Send, Server, Settings, 
  Share2, Shield, ShoppingBag, ShoppingCart, Smartphone, Smile, Speaker, 
  Star, Sun, Tablet, Tag, Target, Terminal, ThumbsUp, Trash2, TrendingUp, 
  Trophy, Truck, Tv, Type, Umbrella, Unlock, Upload, User, Users, Video, 
  Volume2, Watch, Wifi, Wind, Zap, ZoomIn
} from 'lucide-react';

export const curatedIcons = {
  Activity, AlarmClock, AlertCircle, AlertTriangle, AlignLeft, Anchor, 
  Archive, ArrowRight, Award, BarChart, Bell, Book, BookOpen, Bookmark, 
  Box, Brain, Briefcase, Calendar, Camera, Check, CheckCircle2, ChevronRight, 
  ClipboardList, Clock, Cloud, Code, Coffee, Compass, Copy, Cpu, Crosshair, 
  Database, Download, Edit3, Eye, File, FileText, Filter, Flag, Folder, 
  Gift, Globe, GraduationCap, Grid, HardDrive, Hash, Headphones, Heart, 
  HelpCircle, Home, ImageIcon, Info, Key, Layers, Layout, Library, Lightbulb, 
  Link, List, Lock, Mail, Map, MapPin, MessageCircle, MessageSquare, 
  Mic, Monitor, Moon, MousePointer, Music, Navigation, Package, Palette, 
  Paperclip, PenTool, Phone, PieChart, Play, Plus, Power, Printer, Puzzle, 
  Radio, RefreshCw, Rocket, Save, Scissors, Search, Send, Server, Settings, 
  Share2, Shield, ShoppingBag, ShoppingCart, Smartphone, Smile, Speaker, 
  Star, Sun, Tablet, Tag, Target, Terminal, ThumbsUp, Trash2, TrendingUp, 
  Trophy, Truck, Tv, Type, Umbrella, Unlock, Upload, User, Users, Video, 
  Volume2, Watch, Wifi, Wind, Zap, ZoomIn
};

export type CuratedIconName = keyof typeof curatedIcons;
export const curatedIconNames = Object.keys(curatedIcons) as CuratedIconName[];
