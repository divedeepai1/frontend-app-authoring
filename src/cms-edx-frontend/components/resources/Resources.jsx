import { useState, useEffect } from "react";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../../cms-csrftoken";
import DeleteModal from "../common/delete-modal";
import ResourcePanel from "./resource-panel";
import ResourceSection from "./resource-section";
import TitleBar from "./title-bar";
import CourseResourcesDialog from "../courses/CourseResourcesDialog";

const Resources = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClasses = async () => {
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get: ${response.status} ${errorText}`);
      }
      const result = await response.json();
      const cls = result?.classrooms || [];
      setClasses(cls);
      // Keep selectedClassId as empty string ("All Resources") by default
      // Show all courses from all classes when "All Resources" is selected
      const allCourses = [];
      cls.forEach(classroom => {
        if (classroom.courses) {
          allCourses.push(...classroom.courses);
        }
      });
      setCourses(allCourses);
      setSelectedCourseId("");
    } catch (error) {
      console.error("Error fetching classes:", error.message);
    }
  };

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const token = await fetchCsrfToken();
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/resources/list/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch resources: ${response.status} ${errorText}`);
      }

      const resourcesData = await response.json();
      setResources(resourcesData || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResource = async (id) => {
    try {
      const token = await fetchCsrfToken();
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/resources/delete/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({ id: id }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete resource: ${response.status} ${errorText}`);
      }

      // Refresh resources list after deletion
      await fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const handleDownload = async (resource) => {
    if (resource && resource.file_path) {
      try {
        // Fetch the file from S3
        const response = await fetch(resource.file_path);
        const blob = await response.blob();
        
        // Extract filename from resource title or use default
        const filename = resource.title || 'resource';
        
        // Create object URL from blob
        const objectUrl = URL.createObjectURL(blob);
        
        // Create temporary anchor element
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to opening in new tab
        window.open(resource.file_path, '_blank');
      }
    }
  };

  const handleDeleteClick = (resource) => {
    setResourceToDelete(resource);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (resourceToDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        const resourceId = resourceToDelete.id;
        await deleteResource(resourceId);
        setDeleteModalOpen(false);
        setResourceToDelete(null);
      } catch (error) {
        console.error("Error during delete:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setResourceToDelete(null);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClassId(classId);
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleAddResourceClick = () => {
    setIsResourcesDialogOpen(true);
  };

  const handleResourcesDialogClose = () => {
    setIsResourcesDialogOpen(false);
    fetchResources(); // Refresh the resources list
  };

  useEffect(() => {
    fetchClasses();
    fetchResources();
  }, []);

  useEffect(() => {
    if (Array.isArray(classes) && classes.length > 0) {
      if (selectedClassId) {
        // When a specific class is selected, show its courses
        const found = classes.find(c => String(c.id) === String(selectedClassId));
        const c = found?.courses || [];
        setCourses(c);
        // Clear course selection when class changes to allow class-only filtering
        // User can then optionally select a course to filter further
        setSelectedCourseId("");
      } else {
        // When "All Resources" is selected, show all classes' courses
        const allCourses = [];
        classes.forEach(cls => {
          if (cls.courses) {
            allCourses.push(...cls.courses);
          }
        });
        setCourses(allCourses);
        setSelectedCourseId("");
      }
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (resources && Array.isArray(resources)) {
      let filtered = resources;
  
     
      if (selectedCourseId && selectedCourseId !== "") {
     
        filtered = resources.filter(resource => {
          const resourceCourse = resource?.course;
          return resourceCourse !== null && resourceCourse !== undefined && 
                 String(resourceCourse) === String(selectedCourseId);
        });
      } else if (selectedClassId && selectedClassId !== "") {
     
        filtered = resources.filter(resource => {
          const resourceClassroom = resource?.classroom || resource?.classroom_id || resource?.class_id;
          return resourceClassroom !== null && resourceClassroom !== undefined && 
                 String(resourceClassroom) === String(selectedClassId);
        });
      }
      // If neither course nor class selected, show all resources
  
      setFilteredResources(filtered);
    } else {
      setFilteredResources([]);
    }
  }, [resources, selectedClassId, selectedCourseId]);
  


  return (
    <div>
      <TitleBar 
        classes={classes}
        courses={courses}
        selectedClassId={selectedClassId}
        selectedCourseId={selectedCourseId}
        onClassChange={handleClassChange}
        onCourseChange={handleCourseChange}
        onAddResource={handleAddResourceClick}
      />
      
      <div className="p-3">
        {isLoading ? (
          <div className="text-center p-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted mb-0">No resources found</p>
          </div>
        ) : (
          <ResourceSection 
            title="Resources" 
            resources={filteredResources}
            onDownload={handleDownload}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        close={handleDeleteCancel}
        onDeleteSubmit={handleDeleteConfirm}
        title="Delete Resource"
        description={`Are you sure you want to delete "${resourceToDelete?.title}"? This action cannot be undone.`}
        // variant="danger"
        btnDefaultLabel="Delete"
        loading={isDeleting}
        btnPendingLabel="Deleting..."
      />

      {/* Course Resources Dialog */}
      <CourseResourcesDialog
        isOpen={isResourcesDialogOpen}
        onClose={handleResourcesDialogClose}
        classId={selectedClassId}
        courseId={selectedCourseId}
      />
    </div>
  );
};

export default Resources;