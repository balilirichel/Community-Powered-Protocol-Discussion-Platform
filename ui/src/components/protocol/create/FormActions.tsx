import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import Button from '../../ui/Button';

interface FormActionsProps {
  isSubmitting: boolean;
  isValid: boolean;
  onCancel: () => void;
  isEditing?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ isSubmitting, isValid, onCancel, isEditing = false }) => (
  <div className="flex items-center gap-3 pt-2">
    <Button
      variant="outline"
      size="md"
      onClick={onCancel}
      disabled={isSubmitting}
      type="button"
      className="flex-1 sm:flex-none sm:min-w-[120px]"
    >
      Cancel
    </Button>

    <Button
      variant="primary"
      size="md"
      type="submit"
      disabled={!isValid || isSubmitting}
      icon={
        isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={15} />
        )
      }
      iconPosition="right"
      className="flex-1 sm:flex-none sm:min-w-[180px]"
    >
      {isSubmitting ? (isEditing ? 'Saving…' : 'Publishing…') : (isEditing ? 'Save Changes' : 'Publish Protocol')}
    </Button>
  </div>
);

export default FormActions;
