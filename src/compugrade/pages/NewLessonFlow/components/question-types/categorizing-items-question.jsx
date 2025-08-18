import { Card, Form, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";
import { ImageAttach } from '../ui/image-attach'

// Simple UUID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function CategorizingItemsQuestion({ question, onUpdate }) {
  const handleUpdate = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleCategoryNameChange = (categoryId, newName) => {
    const updatedCategories = question.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, name: newName } : cat
    );
    handleUpdate("categories", updatedCategories);
  };

  const handleAddCategory = () => {
    const newCategory = { id: generateId(), name: "", image_url: '', image: '' };
    handleUpdate("categories", [...question.categories, newCategory]);
  };

  const handleRemoveCategory = (categoryId) => {
    const updatedCategories = question.categories.filter(
      (cat) => cat.id !== categoryId
    );
    const updatedItems = question.items.filter(
      (item) => item.categoryId !== categoryId
    );
    onUpdate({
      ...question,
      categories: updatedCategories,
      items: updatedItems,
    });
  };

  const handleItemTextChange = (itemId, newText) => {
    const updatedItems = question.items.map((item) =>
      item.id === itemId ? { ...item, text: newText } : item
    );
    handleUpdate("items", updatedItems);
  };

  const handleItemCategoryChange = (itemId, newCategoryId) => {
    const updatedItems = question.items.map((item) =>
      item.id === itemId ? { ...item, categoryId: newCategoryId } : item
    );
    handleUpdate("items", updatedItems);
  };

  const handleAddItem = () => {
    const newItem = { id: generateId(), text: "", categoryId: "", image_url: '', image: '' };
    handleUpdate("items", [...question.items, newItem]);
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = question.items.filter((item) => item.id !== itemId);
    handleUpdate("items", updatedItems);
  };

  const handleQuestionImageSelect = (file) => {
    const url = URL.createObjectURL(file)
    handleUpdate('image_url', url)
    handleUpdate('image_name', file.name)
  }
  const handleQuestionImageRemove = () => {
    handleUpdate('image_url', '')
    handleUpdate('image_name', '')
  }

  const handleItemImageSelect = (itemId, file) => {
    const url = URL.createObjectURL(file)
    const updatedItems = question.items.map((item) =>
      item.id === itemId ? { ...item, image_url: url, image: file.name } : item
    )
    handleUpdate('items', updatedItems)
  }
  const handleItemImageRemove = (itemId) => {
    const updatedItems = question.items.map((item) =>
      item.id === itemId ? { ...item, image_url: '', image: '' } : item
    )
    handleUpdate('items', updatedItems)
  }

  const handleCategoryImageSelect = (categoryId, file) => {
    const url = URL.createObjectURL(file)
    const updatedCategories = question.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, image_url: url, image: file.name } : cat
    )
    handleUpdate('categories', updatedCategories)
  }
  const handleCategoryImageRemove = (categoryId) => {
    const updatedCategories = question.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, image_url: '', image: '' } : cat
    )
    handleUpdate('categories', updatedCategories)
  }

  // Validation
  const natural_textError = !question.natural_text || !question.natural_text.trim()
    ? 'Question text is required.'
    : null
  const categories = question.categories || []
  const hasAtLeastOneCategory = categories.length >= 1
  const hasEmptyCategoryName = categories.some((c) => !c.name || !c.name.trim())
  const items = question.items || []
  const hasEmptyItemText = items.some((i) => !i.text || !i.text.trim())
  const hasUnassignedItem = items.some((i) => !i.categoryId)

  return (
    <Card className="border-start border-4 border-info">
      <Card.Header>
        <h5 className="mb-0">Categorizing Items Question</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-2 d-flex justify-content-between align-items-center">
            <Form.Label className="mb-0">Question Text (Instructions)</Form.Label>
            <ImageAttach
              image={question.image_url ? { url: question.image_url } : null}
              onSelect={handleQuestionImageSelect}
              onRemove={handleQuestionImageRemove}
              label="Attach question image"
              scope={{ questionId: question.id, kind: 'question' }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g., Drag each item into its correct category."
              value={question.natural_text}
              onChange={(e) => handleUpdate("natural_text", e.target.value)}
              isInvalid={!!natural_textError}
            />
            {natural_textError && (
              <Form.Text className="text-danger">{natural_textError}</Form.Text>
            )}
            {question.image_url && (
              <div className="mt-2"><img src={question.image_url} alt="question" style={{maxHeight:120}} /></div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-black">Categories</Form.Label>
            {question.categories.map((category, index) => (
              <div
                key={category.id}
                className="d-flex align-items-center gap-2 mb-2"
              >
                <Form.Control
                  type="text"
                  value={category.name}
                  onChange={(e) =>
                    handleCategoryNameChange(category.id, e.target.value)
                  }
                  placeholder={`Category ${index + 1} Name`}
                  className="flex-grow-1"
                  isInvalid={!category.name || !category.name.trim()}
                />
                <ImageAttach
                  image={category.image_url ? { url: category.image_url } : null}
                  onSelect={(file) => handleCategoryImageSelect(category.id, file)}
                  onRemove={() => handleCategoryImageRemove(category.id)}
                  label="Attach category image"
                  scope={{ questionId: question.id, kind: 'category', refId: category.id }}
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveCategory(category.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCategory}
              className="mt-2 primary-button px-3 py-1"
            >
              <Plus size={16} className="me-2 mb-1" /> Add Category
            </button>
            {!hasAtLeastOneCategory && (
              <div><Form.Text className="text-danger">Add at least one category.</Form.Text></div>
            )}
            {hasEmptyCategoryName && (
              <div><Form.Text className="text-danger">Category names cannot be empty.</Form.Text></div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Items</Form.Label>
            {question.items.map((item, index) => (
              <div
                key={item.id}
                className="d-flex align-items-center gap-2 mb-2"
              >
                <Form.Control
                  type="text"
                  value={item.text}
                  onChange={(e) =>
                    handleItemTextChange(item.id, e.target.value)
                  }
                  placeholder={`Item ${index + 1} Text`}
                  className="flex-grow-1"
                  isInvalid={!item.text || !item.text.trim()}
                />
                <ImageAttach
                  image={item.image_url ? { url: item.image_url } : null}
                  onSelect={(file) => handleItemImageSelect(item.id, file)}
                  onRemove={() => handleItemImageRemove(item.id)}
                  label="Attach item image"
                  scope={{ questionId: question.id, kind: 'item', refId: item.id }}
                />
                <Form.Control
                  as="select"
                  value={item.categoryId}
                  onChange={(e) =>
                    handleItemCategoryChange(item.id, e.target.value)
                  }
                  style={{ width: "200px" }}
                  isInvalid={!item.categoryId}
                >
                  <option value="">Select Category</option>
                  {question.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name || "Unnamed Category"}
                    </option>
                  ))}
                </Form.Control>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="mt-2 primary-button px-3 py-1"
            >
              <Plus size={16} className="me-2 mb-1" /> Add Item
            </button>
            {hasEmptyItemText && (
              <div><Form.Text className="text-danger">Item text cannot be empty.</Form.Text></div>
            )}
            {hasUnassignedItem && (
              <div><Form.Text className="text-danger">Assign a category to each item.</Form.Text></div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hint (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Provide hint..."
              value={question.explanation || ""}
              onChange={(e) => handleUpdate("explanation", e.target.value)}
            />
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
}
