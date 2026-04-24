// Templates Module - Workout Template Management
// Handles CRUD operations for workout templates

const STORAGE_KEY = "fitness_templates";

/**
 * Generate a unique template ID
 * @returns {string} Unique template ID
 */
function generateTemplateId() {
  return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate a template object
 * @param {Object} template - Template to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateTemplate(template) {
  const errors = [];

  if (!template.name || typeof template.name !== "string" || template.name.trim().length === 0) {
    errors.push("Template name is required");
  }

  if (!Array.isArray(template.exercises) || template.exercises.length === 0) {
    errors.push("Template must have at least one exercise");
  }

  if (template.exercises) {
    template.exercises.forEach((exercise, index) => {
      if (!exercise.name || typeof exercise.name !== "string" || exercise.name.trim().length === 0) {
        errors.push(`Exercise ${index + 1} must have a name`);
      }
    });
  }

  // Check for unique template name
  const templates = getAllTemplates();
  if (templates.some(t => t.name === template.name.trim())) {
    errors.push("Template name must be unique");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a new template
 * @param {string} name - Template name
 * @param {string} description - Template description
 * @param {Array} exercises - Array of exercise objects
 * @returns {Object} Created template or null if invalid
 */
function createTemplate(name, description, exercises) {
  const template = {
    id: generateTemplateId(),
    name: name.trim(),
    description: description ? description.trim() : "",
    createdAt: Date.now(),
    lastUsed: null,
    useCount: 0,
    exercises: exercises.map(ex => ({
      name: ex.name.trim(),
      trackingMode: ex.trackingMode || "weighted",
      defaultSets: ex.defaultSets || 3
    }))
  };

  const validation = validateTemplate(template);
  if (!validation.valid) {
    console.error("Template validation failed:", validation.errors);
    return null;
  }

  const templates = getAllTemplates();
  templates.push(template);
  saveTemplates(templates);

  return template;
}

/**
 * Get a template by ID
 * @param {string} templateId - Template ID
 * @returns {Object|null} Template or null if not found
 */
function getTemplate(templateId) {
  const templates = getAllTemplates();
  return templates.find(t => t.id === templateId) || null;
}

/**
 * Get all templates
 * @returns {Array} Array of all templates
 */
function getAllTemplates() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading templates:", error);
    return [];
  }
}

/**
 * Update a template
 * @param {string} templateId - Template ID
 * @param {Object} updates - Properties to update
 * @returns {Object|null} Updated template or null if not found
 */
function updateTemplate(templateId, updates) {
  const templates = getAllTemplates();
  const index = templates.findIndex(t => t.id === templateId);

  if (index === -1) {
    return null;
  }

  const updatedTemplate = {
    ...templates[index],
    ...updates,
    id: templateId, // Preserve ID
    createdAt: templates[index].createdAt // Preserve creation date
  };

  const validation = validateTemplate(updatedTemplate);
  if (!validation.valid) {
    console.error("Template validation failed:", validation.errors);
    return null;
  }

  templates[index] = updatedTemplate;
  saveTemplates(templates);

  return updatedTemplate;
}

/**
 * Delete a template
 * @param {string} templateId - Template ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteTemplate(templateId) {
  const templates = getAllTemplates();
  const filtered = templates.filter(t => t.id !== templateId);

  if (filtered.length === templates.length) {
    return false;
  }

  saveTemplates(filtered);
  return true;
}

/**
 * Use a template (increments use count and updates last used)
 * @param {string} templateId - Template ID
 * @returns {Object|null} Template or null if not found
 */
function useTemplate(templateId) {
  const templates = getAllTemplates();
  const index = templates.findIndex(t => t.id === templateId);

  if (index === -1) {
    return null;
  }

  templates[index].lastUsed = Date.now();
  templates[index].useCount = (templates[index].useCount || 0) + 1;

  saveTemplates(templates);

  return templates[index];
}

/**
 * Search templates by name or description
 * @param {string} query - Search query
 * @returns {Array} Matching templates
 */
function searchTemplates(query) {
  const templates = getAllTemplates();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return templates;
  }

  return templates.filter(t =>
    t.name.toLowerCase().includes(normalizedQuery) ||
    t.description.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Sort templates
 * @param {Array} templates - Templates to sort
 * @param {string} sortBy - Sort key: "name", "created", "used", "count"
 * @returns {Array} Sorted templates
 */
function sortTemplates(templates, sortBy = "created") {
  const sorted = [...templates];

  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "used":
      sorted.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
      break;
    case "count":
      sorted.sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
      break;
    case "created":
    default:
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return sorted;
}

/**
 * Get template usage statistics
 * @param {string} templateId - Template ID
 * @returns {Object} Usage statistics
 */
function getTemplateUsageStats(templateId) {
  const template = getTemplate(templateId);

  if (!template) {
    return null;
  }

  return {
    useCount: template.useCount || 0,
    lastUsed: template.lastUsed,
    daysSinceLastUsed: template.lastUsed
      ? Math.floor((Date.now() - template.lastUsed) / (1000 * 60 * 60 * 24))
      : null,
    daysSinceCreated: Math.floor((Date.now() - template.createdAt) / (1000 * 60 * 60 * 24))
  };
}

/**
 * Save templates to localStorage
 * @param {Array} templates - Templates to save
 */
function saveTemplates(templates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Error saving templates:", error);
  }
}

/**
 * Export templates as JSON string
 * @returns {string} JSON string of all templates
 */
function exportTemplates() {
  const templates = getAllTemplates();
  return JSON.stringify(templates, null, 2);
}

/**
 * Import templates from JSON string
 * @param {string} jsonString - JSON string to import
 * @returns {Object} { success: boolean, imported: number, errors: string[] }
 */
function importTemplates(jsonString) {
  const result = {
    success: false,
    imported: 0,
    errors: []
  };

  try {
    const imported = JSON.parse(jsonString);

    if (!Array.isArray(imported)) {
      result.errors.push("Invalid format: expected array of templates");
      return result;
    }

    const existingTemplates = getAllTemplates();
    let importedCount = 0;

    imported.forEach((template, index) => {
      const validation = validateTemplate(template);
      if (!validation.valid) {
        result.errors.push(`Template ${index + 1}: ${validation.errors.join(", ")}`);
        return;
      }

      // Check for duplicate names
      const isDuplicate = existingTemplates.some(t => t.name.toLowerCase() === template.name.toLowerCase());
      if (isDuplicate) {
        result.errors.push(`Template ${index + 1}: "${template.name}" already exists`);
        return;
      }

      // Generate new ID to avoid conflicts
      const newTemplate = {
        ...template,
        id: generateTemplateId(),
        createdAt: Date.now(),
        lastUsed: null,
        useCount: 0
      };

      existingTemplates.push(newTemplate);
      importedCount++;
    });

    saveTemplates(existingTemplates);
    result.imported = importedCount;
    result.success = importedCount > 0;

  } catch (error) {
    result.errors.push(`Parse error: ${error.message}`);
  }

  return result;
}

// Export for use in app.js
window.templates = {
  createTemplate,
  getTemplate,
  getAllTemplates,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  searchTemplates,
  sortTemplates,
  getTemplateUsageStats,
  exportTemplates,
  importTemplates,
  validateTemplate
};
