import { useState, useEffect } from "react";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../../cms-csrftoken";
import DeleteModal from "../common/delete-modal";
import ResourcePanel from "./resource-panel";
import ResourceSection from "./resource-section";
import TitleBar from "./title-bar";

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
      if (cls.length) {
        setSelectedClassId(cls[0].id);
        const firstCourses = cls[0]?.courses || [];
        setCourses(firstCourses);
        if (firstCourses.length) {
          setSelectedCourseId(firstCourses[0].id);
        }
      }
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

  const deleteResource = async (s3Key) => {
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
          body: JSON.stringify({ s3_key: s3Key }),
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
    if (resourceToDelete) {
      // For now, we'll use the file_path as s3_key until the API provides it
      const s3Key = resourceToDelete.s3_key;
      await deleteResource(s3Key);
      setDeleteModalOpen(false);
      setResourceToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setResourceToDelete(null);
  };

  const handleClassChange = (classId) => {
    setSelectedClassId(classId);
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
  };

  useEffect(() => {
    fetchClasses();
    fetchResources();
  }, []);

  useEffect(() => {
    if (classes && classes.length > 0) {
      const found = classes.find(c => String(c.id) === String(selectedClassId));
      const c = found?.courses || [];
      setCourses(c);
      if (c.length) {
        setSelectedCourseId(c[0].id);
      } else {
        setSelectedCourseId("");
      }
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (resources && Array.isArray(resources)) {
      let filtered = resources;
  
      if (selectedCourseId) {
        filtered = resources.filter(resource => resource.course === selectedCourseId);
      } else if (selectedClassId) {
        filtered = resources.filter(resource => resource.classroom === selectedClassId);
      }
  
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
      />
    </div>
  );
};

export default Resources;