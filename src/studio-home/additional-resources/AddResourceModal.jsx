import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionRow,
  Alert,
  Badge,
  Button,
  Form,
  Icon,
  IconButton,
  ModalDialog,
  Spinner,
  Stack,
} from '@openedx/paragon';
import {
  Add as AddIcon,
  DeleteOutline,
  Download,
  FolderOpen,
} from '@openedx/paragon/icons';
import * as resourcesApi from './resourcesApi';

function openResource(resource) {
  if (!resource?.file_path) return;
  window.open(resource.file_path, '_blank', 'noopener,noreferrer');
}

export default function AddResourceModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryMode, setCategoryMode] = useState('existing');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const categoryName = categoryMode === 'new' ? newCategory.trim() : selectedCategory;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, browse] = await Promise.all([
        resourcesApi.fetchCategories(),
        resourcesApi.browseResources(),
      ]);
      const normalizedCats = (cats || []).map((item) => ({
        name: item?.name || '',
        resource_count: item?.resource_count ?? 0,
      })).filter((item) => item.name);
      setCategories(normalizedCats);
      setResources(resourcesApi.flattenBrowsePayload(browse));
      setSelectedCategory((prev) => {
        if (prev && normalizedCats.some((item) => item.name === prev)) return prev;
        return normalizedCats[0]?.name || '';
      });
    } catch (err) {
      setError(err?.message || 'Unable to load resources.');
      setCategories([]);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    loadData();
    return undefined;
  }, [isOpen, loadData]);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess('');
      setTitle('');
      setSelectedFile(null);
      setProgress(0);
      setUploading(false);
      setCategoryMode('existing');
      setNewCategory('');
      setFilterCategory('all');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  const filteredResources = useMemo(() => {
    if (filterCategory === 'all') return resources;
    return resources.filter((item) => String(item.category) === String(filterCategory));
  }, [resources, filterCategory]);

  const handleUpload = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!categoryName) {
      setError('Please select or create a category.');
      return;
    }
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      await resourcesApi.uploadResourceMultipart({
        file: selectedFile,
        category: categoryName,
        title,
        onProgress: setProgress,
      });
      setSuccess(`"${title.trim() || selectedFile.name}" uploaded successfully.`);
      setTitle('');
      setSelectedFile(null);
      setNewCategory('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (categoryMode === 'new') {
        setCategoryMode('existing');
        setSelectedCategory(categoryName);
      }
      await loadData();
    } catch (err) {
      setError(err?.message || 'Unable to upload resource.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (resource) => {
    if (!resource?.id) return;
    setDeletingId(resource.id);
    setError('');
    try {
      await resourcesApi.deleteResource(resource.id);
      setSuccess(`"${resource.title || 'Resource'}" deleted.`);
      await loadData();
    } catch (err) {
      setError(err?.message || 'Unable to delete resource.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCategory = async (name) => {
    if (!name) return;
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Delete category "${name}" and all of its resources? This cannot be undone.`,
    );
    if (!confirmed) return;
    setError('');
    try {
      await resourcesApi.deleteCategory(name);
      setSuccess(`Category "${name}" deleted.`);
      if (selectedCategory === name) setSelectedCategory('');
      if (filterCategory === name) setFilterCategory('all');
      await loadData();
    } catch (err) {
      setError(err?.message || 'Unable to delete category.');
    }
  };

  return (
    <ModalDialog
      title="Additional resources"
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <Icon src={FolderOpen} />
            <span>Additional resources</span>
          </Stack>
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {error ? <Alert variant="danger" className="mb-3">{error}</Alert> : null}
        {success ? <Alert variant="success" className="mb-3">{success}</Alert> : null}

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="border rounded p-3 bg-light h-100">
              <h3 className="h5 mb-3">Upload resource</h3>
              <Form onSubmit={handleUpload}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.RadioSet
                    name="category-mode"
                    value={categoryMode}
                    onChange={(e) => setCategoryMode(e.target.value)}
                    inline
                  >
                    <Form.Radio value="existing">Existing</Form.Radio>
                    <Form.Radio value="new">New category</Form.Radio>
                  </Form.RadioSet>
                </Form.Group>

                {categoryMode === 'existing' ? (
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={uploading || !categories.length}
                    >
                      {!categories.length ? <option value="">No categories yet</option> : null}
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                ) : (
                  <Form.Group className="mb-3">
                    <Form.Control
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g. Posters"
                      disabled={uploading}
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Title (optional)</Form.Label>
                  <Form.Control
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Defaults to file name"
                    disabled={uploading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>File</Form.Label>
                  <Form.Control
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                  />
                  {selectedFile ? (
                    <Form.Control.Feedback className="d-block text-muted mt-1">
                      Selected: {selectedFile.name}
                    </Form.Control.Feedback>
                  ) : null}
                </Form.Group>

                {uploading ? (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Uploading…</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  iconBefore={AddIcon}
                  disabled={uploading || !categoryName || !selectedFile}
                >
                  {uploading ? 'Uploading…' : 'Upload resource'}
                </Button>
              </Form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h3 className="h5 mb-0">Library</h3>
              <Form.Control
                as="select"
                className="w-auto"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Form.Control>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" screenReaderText="Loading resources" />
              </div>
            ) : (
              <>
                {categories.length ? (
                  <Stack direction="horizontal" gap={2} className="flex-wrap mb-3">
                    {categories.map((cat) => (
                      <Badge
                        key={cat.name}
                        variant="light"
                        className="border d-inline-flex align-items-center"
                      >
                        <span className="mr-2">{cat.name}</span>
                        <IconButton
                          src={DeleteOutline}
                          iconAs={Icon}
                          alt={`Delete category ${cat.name}`}
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteCategory(cat.name)}
                        />
                      </Badge>
                    ))}
                  </Stack>
                ) : null}

                {!filteredResources.length ? (
                  <div className="border rounded p-4 text-center text-muted">
                    No resources yet. Upload a file to get started.
                  </div>
                ) : (
                  <div className="table-responsive border rounded">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="thead-light">
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResources.map((resource) => (
                          <tr key={resource.id || resource.s3_key}>
                            <td className="align-middle">{resource.title || '—'}</td>
                            <td className="align-middle">
                              <Badge variant="info">{resource.category || '—'}</Badge>
                            </td>
                            <td className="align-middle text-right text-nowrap">
                              <IconButton
                                src={Download}
                                iconAs={Icon}
                                alt="View or download"
                                size="inline"
                                onClick={() => openResource(resource)}
                                disabled={!resource.file_path}
                              />
                              <IconButton
                                src={DeleteOutline}
                                iconAs={Icon}
                                alt="Delete resource"
                                size="inline"
                                variant="danger"
                                className="ml-1"
                                onClick={() => handleDelete(resource)}
                                disabled={deletingId === resource.id}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">Close</ModalDialog.CloseButton>
          <Button variant="outline-primary" onClick={loadData} disabled={loading || uploading}>
            Refresh
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
