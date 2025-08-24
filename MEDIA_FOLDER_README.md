# Media Folder - Automatic Slider Images

## Overview

The Adhigam website now includes automatic image loading from a `media/` folder for the homepage slider. This feature allows you to easily add new slider images without modifying the code.

## 📁 Media Folder Structure

```
Adhigam/
├── media/
│   ├── slide_1.jpg
│   ├── slide_2.jpg
│   ├── slide_3.jpg
│   └── ...
├── adhigam.html
├── style.css
├── script.js
└── Adhigam_Logo.jpg
```

## 🖼️ How to Add Images

### 1. **Naming Convention**
Images must follow this naming pattern:
- `slide_1.jpg` (or .png, .gif, .webp)
- `slide_2.jpg`
- `slide_3.jpg`
- And so on...

### 2. **Supported Formats**
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

### 3. **Image Requirements**
- **Recommended Size**: 1600x900 pixels (16:9 aspect ratio)
- **File Size**: Keep under 2MB for optimal loading
- **Quality**: High quality, clear images
- **Content**: Relevant to Adhigam's mission and activities

## 🚀 How It Works

### **Automatic Detection**
1. The website automatically scans the `media/` folder on page load
2. It looks for images named `slide_1`, `slide_2`, etc.
3. Found images are automatically loaded into the slider
4. If no images are found, it uses the default Unsplash images

### **Priority System**
1. **Media Folder Images**: Highest priority
2. **Default Images**: Fallback to Unsplash images
3. **Logo Display**: Adhigam logo is always shown on each slide

## 📋 Step-by-Step Guide

### **Adding New Slider Images**

1. **Prepare Your Images**
   ```
   - Resize to 1600x900 pixels
   - Optimize file size (under 2MB)
   - Save in JPG, PNG, GIF, or WebP format
   ```

2. **Name Your Images**
   ```
   slide_1.jpg
   slide_2.jpg
   slide_3.jpg
   ```

3. **Place in Media Folder**
   ```
   Copy your images to the media/ folder
   ```

4. **Refresh Website**
   ```
   Reload the page to see your new images
   ```

### **Example Image Themes**

**Education & Learning**
- Children in classrooms
- Art and craft activities
- Storytelling sessions
- Group learning activities

**Cultural Activities**
- Kathak dance performances
- Theatre workshops
- Cultural celebrations
- Traditional art forms

**Community Engagement**
- Community meetings
- Volunteer activities
- Outreach programs
- Community events

**Impact & Success**
- Before/after transformations
- Success stories
- Community development
- Positive outcomes

## 🛠️ Technical Details

### **JavaScript Function**
```javascript
function initSliderWithMedia() {
    const mediaFolder = 'media/';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // Scans for slide_1.jpg, slide_2.jpg, etc.
    // Automatically loads found images
    // Falls back to default images if none found
}
```

### **Image Loading Process**
1. **Check Existence**: Tests if image file exists
2. **Load Image**: Loads image into slider background
3. **Update Display**: Replaces default images with custom ones
4. **Maintain Logo**: Keeps Adhigam logo visible on all slides

## 📱 Responsive Design

### **Image Scaling**
- **Desktop**: Full 1600x900 display
- **Tablet**: Scaled proportionally
- **Mobile**: Optimized for mobile viewing

### **Performance Optimization**
- **Lazy Loading**: Images load as needed
- **Caching**: Browser caches images for faster loading
- **Compression**: Optimized file sizes

## 🔧 Customization Options

### **Changing Image Order**
Simply rename your files:
```
slide_1.jpg → slide_2.jpg
slide_2.jpg → slide_1.jpg
```

### **Adding More Images**
Continue the numbering:
```
slide_4.jpg
slide_5.jpg
slide_6.jpg
```

### **Removing Images**
Delete files from the media folder:
```
Delete slide_3.jpg to remove that slide
```

## 🚨 Troubleshooting

### **Images Not Loading**
- **Check File Names**: Must be `slide_1.jpg`, `slide_2.jpg`, etc.
- **Check File Format**: Must be .jpg, .png, .gif, or .webp
- **Check File Location**: Must be in the `media/` folder
- **Check File Size**: Keep under 2MB

### **Images Not Displaying**
- **Check Browser Console**: Look for 404 errors
- **Check File Permissions**: Ensure files are readable
- **Check File Path**: Ensure media folder is in correct location

### **Performance Issues**
- **Optimize Images**: Compress large files
- **Reduce File Count**: Limit to 5-10 images
- **Use WebP Format**: Better compression

## 📊 Best Practices

### **Image Selection**
- **High Quality**: Clear, professional images
- **Relevant Content**: Related to Adhigam's mission
- **Diverse Representation**: Show different activities and people
- **Positive Messaging**: Convey hope and empowerment

### **File Management**
- **Regular Updates**: Refresh images periodically
- **Backup**: Keep original files safe
- **Organization**: Use descriptive file names
- **Optimization**: Compress images for web

### **Content Guidelines**
- **Mission Alignment**: Images should reflect Adhigam's values
- **Community Focus**: Show local community involvement
- **Impact Visualization**: Demonstrate positive outcomes
- **Cultural Sensitivity**: Respect local customs and traditions

## 🔮 Future Enhancements

### **Planned Features**
- **Admin Panel Integration**: Upload images through admin panel
- **Image Cropping**: Automatic cropping to fit slider
- **Multiple Formats**: Support for more image formats
- **Video Support**: Add video slides to slider
- **Dynamic Loading**: Load images based on user preferences

### **Advanced Features**
- **Image Analytics**: Track which images perform best
- **A/B Testing**: Test different image combinations
- **Seasonal Content**: Automatic seasonal image rotation
- **User-Generated Content**: Allow community image submissions

---

**Note**: The media folder feature makes it easy to keep your website fresh and engaging by simply adding new images to the folder. No technical knowledge required! 